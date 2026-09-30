import pandas as pd
import numpy as np
import os
import json
import joblib
import sys
from datetime import datetime

from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix

from sklearn.dummy import DummyClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, HistGradientBoostingClassifier

def train_and_evaluate():
    train_path = "ml/data/processed/train.csv"
    test_path = "ml/data/processed/test.csv"
    models_dir = "ml/models"
    metrics_dir = "ml/outputs/metrics"
    
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(metrics_dir, exist_ok=True)

    train_df = pd.read_csv(train_path)
    test_df = pd.read_csv(test_path)

    X_train = train_df.drop(columns=['status'])
    y_train = (train_df['status'] == 'Placed').astype(int)

    X_test = test_df.drop(columns=['status'])
    y_test = (test_df['status'] == 'Placed').astype(int)

    num_cols = ['ssc_p', 'hsc_p', 'degree_p', 'etest_p', 'mba_p']
    cat_cols = ['gender', 'ssc_b', 'hsc_b', 'hsc_s', 'degree_t', 'workex', 'specialisation']

    # Preprocessing pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), num_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_cols)
        ]
    )

    candidate_models = {
        "DummyClassifier": DummyClassifier(strategy='most_frequent'),
        "LogisticRegression": LogisticRegression(random_state=42, max_iter=1000, C=1.0),
        "DecisionTree": DecisionTreeClassifier(random_state=42, max_depth=4),
        "RandomForest": RandomForestClassifier(random_state=42, n_estimators=100, max_depth=5),
        "GradientBoosting": GradientBoostingClassifier(random_state=42, n_estimators=100, learning_rate=0.05),
        "HistGradientBoosting": HistGradientBoostingClassifier(random_state=42)
    }

    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    comparison_results = {}
    best_model_name = None
    best_cv_f1 = -1.0
    best_pipeline = None

    print("=== 5-FOLD STRATIFIED CROSS-VALIDATION RESULTS ===")
    for name, clf in candidate_models.items():
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', clf)
        ])

        scoring = ['accuracy', 'precision', 'recall', 'f1', 'roc_auc']
        scores = cross_validate(pipeline, X_train, y_train, cv=skf, scoring=scoring)

        cv_metrics = {
            "cv_accuracy": float(scores['test_accuracy'].mean()),
            "cv_precision": float(scores['test_precision'].mean()),
            "cv_recall": float(scores['test_recall'].mean()),
            "cv_f1": float(scores['test_f1'].mean()),
            "cv_roc_auc": float(scores['test_roc_auc'].mean())
        }

        comparison_results[name] = cv_metrics
        print(f"{name:20s} | Acc: {cv_metrics['cv_accuracy']:.4f} | F1: {cv_metrics['cv_f1']:.4f} | ROC-AUC: {cv_metrics['cv_roc_auc']:.4f}")

        if cv_metrics['cv_f1'] > best_cv_f1:
            best_cv_f1 = cv_metrics['cv_f1']
            best_model_name = name
            best_pipeline = pipeline

    # Fit best pipeline on full training data
    best_pipeline.fit(X_train, y_train)

    # Evaluate on held-out test set
    y_pred = best_pipeline.predict(X_test)
    y_proba = best_pipeline.predict_proba(X_test)[:, 1]

    test_accuracy = float(accuracy_score(y_test, y_pred))
    test_precision = float(precision_score(y_test, y_pred))
    test_recall = float(recall_score(y_test, y_pred))
    test_f1 = float(f1_score(y_test, y_pred))
    test_roc_auc = float(roc_auc_score(y_test, y_proba))
    cm = confusion_matrix(y_test, y_pred).tolist()

    print(f"\nSelected Best Model: {best_model_name}")
    print(f"Test Accuracy: {test_accuracy:.4f}, Test F1: {test_f1:.4f}, Test ROC-AUC: {test_roc_auc:.4f}")

    # Save comparison metrics
    with open(os.path.join(metrics_dir, "model_comparison.json"), "w") as f:
        json.dump(comparison_results, f, indent=2)

    # Save best model joblib
    joblib_path = os.path.join(models_dir, "best_model.joblib")
    joblib.dump(best_pipeline, joblib_path)
    print(f"Saved best model pipeline to {joblib_path}")

    # Feature Importance (if applicable)
    feature_importance = {}
    classifier = best_pipeline.named_steps['classifier']
    preproc = best_pipeline.named_steps['preprocessor']
    cat_encoder = preproc.named_transformers_['cat']
    encoded_cat_names = list(cat_encoder.get_feature_names_out(cat_cols))
    all_feature_names = num_cols + encoded_cat_names

    if hasattr(classifier, 'coef_'):
        coefs = classifier.coef_[0]
        for name, val in zip(all_feature_names, coefs):
            feature_importance[name] = float(val)
    elif hasattr(classifier, 'feature_importances_'):
        imps = classifier.feature_importances_
        for name, val in zip(all_feature_names, imps):
            feature_importance[name] = float(val)

    # Save Model Metadata
    metadata = {
        "model_name": best_model_name,
        "dataset": "Placement_Data_Full_Class.csv",
        "kaggle_source": "https://www.kaggle.com/competitions/binary-classification-of-student-placement-outcomes",
        "target": "status (Placed=1, Not Placed=0)",
        "features": {
            "numerical": num_cols,
            "categorical": cat_cols,
            "all_transformed": all_feature_names
        },
        "training_date": datetime.now().isoformat(),
        "train_rows": len(train_df),
        "test_rows": len(test_df),
        "cv_results": comparison_results[best_model_name],
        "test_metrics": {
            "accuracy": test_accuracy,
            "precision": test_precision,
            "recall": test_recall,
            "f1": test_f1,
            "roc_auc": test_roc_auc,
            "confusion_matrix": cm
        },
        "feature_importances": feature_importance,
        "python_version": sys.version.split()[0],
        "sklearn_version": pd.__version__
    }

    with open(os.path.join(models_dir, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Model metadata saved to {models_dir}/model_metadata.json")

if __name__ == "__main__":
    train_and_evaluate()
