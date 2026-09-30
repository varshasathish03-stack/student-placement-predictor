import joblib
import json
import os
import pandas as pd
import numpy as np
from backend.app.schemas import StudentInput, PredictionResponse, FeatureContribution

class PredictionService:
    def __init__(self, model_path="ml/models/best_model.joblib", metadata_path="ml/models/model_metadata.json"):
        self.model_path = model_path
        self.metadata_path = metadata_path
        self.pipeline = None
        self.metadata = {}
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            self.pipeline = joblib.load(self.model_path)
            print(f"Successfully loaded ML model from {self.model_path}")
        else:
            print(f"Warning: Model file not found at {self.model_path}")

        if os.path.exists(self.metadata_path):
            with open(self.metadata_path, 'r') as f:
                self.metadata = json.load(f)

    def predict(self, input_data: StudentInput) -> PredictionResponse:
        if self.pipeline is None:
            raise RuntimeError("Model pipeline is not loaded.")

        input_dict = input_data.model_dump()
        input_df = pd.DataFrame([input_dict])

        # Actual Model Prediction Probability
        proba = float(self.pipeline.predict_proba(input_df)[0][1])
        prediction_label = "Placed" if proba >= 0.5 else "Not Placed"
        model_version = self.metadata.get("model_name", "LogisticRegression_v1.0")

        # Feature Impact Explanation
        explanations = self._explain_prediction(input_df, input_dict)

        return PredictionResponse(
            prediction=prediction_label,
            probability=round(proba, 4),
            model_version=model_version,
            explanation=explanations
        )

    def _explain_prediction(self, df_row: pd.DataFrame, raw_dict: dict) -> list[FeatureContribution]:
        classifier = self.pipeline.named_steps['classifier']
        preproc = self.pipeline.named_steps['preprocessor']

        # Get feature names from preprocessor
        num_cols = ['ssc_p', 'hsc_p', 'degree_p', 'etest_p', 'mba_p']
        cat_cols = ['gender', 'ssc_b', 'hsc_b', 'hsc_s', 'degree_t', 'workex', 'specialisation']

        cat_encoder = preproc.named_transformers_['cat']
        encoded_cat_names = list(cat_encoder.get_feature_names_out(cat_cols))
        all_feature_names = num_cols + encoded_cat_names

        # Transform single input row
        transformed_row = preproc.transform(df_row)[0]

        explanations = []
        if hasattr(classifier, 'coef_'):
            coefs = classifier.coef_[0]
            contributions = transformed_row * coefs

            # Group feature contributions back to user-facing attributes
            feature_impacts = {
                'ssc_p (10th %)': (raw_dict['ssc_p'], float(contributions[0]), "Secondary education percentage"),
                'hsc_p (12th %)': (raw_dict['hsc_p'], float(contributions[1]), "Higher secondary percentage"),
                'degree_p (Degree %)': (raw_dict['degree_p'], float(contributions[2]), "Undergraduate degree percentage"),
                'etest_p (Employability Test)': (raw_dict['etest_p'], float(contributions[3]), "College employability test score"),
                'mba_p (MBA %)': (raw_dict['mba_p'], float(contributions[4]), "Post-graduate MBA percentage"),
                'workex (Work Experience)': (raw_dict['workex'], float(sum(contributions[len(num_cols):])), "Prior work experience status"),
                'specialisation (MBA Stream)': (raw_dict['specialisation'], float(contributions[-1]), "MBA specialization branch")
            }

            for feat_name, (val, impact, desc) in feature_impacts.items():
                explanations.append(FeatureContribution(
                    feature=feat_name,
                    feature_val=val,
                    impact=round(impact, 4),
                    description=desc
                ))

            # Sort by absolute impact magnitude
            explanations.sort(key=lambda x: abs(x.impact), reverse=True)

        return explanations

prediction_service = PredictionService()
