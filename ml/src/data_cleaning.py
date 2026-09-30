import pandas as pd
import numpy as np
import os
import json
from sklearn.model_selection import train_test_split

def clean_and_split():
    raw_path = "ml/data/raw/Placement_Data_Full_Class.csv"
    processed_dir = "ml/data/processed"
    reports_dir = "ml/outputs/reports"
    os.makedirs(processed_dir, exist_ok=True)
    os.makedirs(reports_dir, exist_ok=True)

    df = pd.read_csv(raw_path)
    print(f"Loaded raw data: {df.shape[0]} rows, {df.shape[1]} columns")

    # 1. Leakage & ID column check
    leakage_cols = ['salary']
    id_cols = ['sl_no']
    
    leakage_report = {
        "raw_rows": int(df.shape[0]),
        "raw_cols": int(df.shape[1]),
        "id_cols_removed": id_cols,
        "leakage_cols_removed": leakage_cols,
        "leakage_reason": "salary column is populated only for placed candidates (67 NaNs for Not Placed)",
        "missing_summary": df.isnull().sum().to_dict(),
        "duplicates": int(df.duplicated().sum())
    }
    
    with open(os.path.join(reports_dir, "leakage_report.json"), "w") as f:
        json.dump(leakage_report, f, indent=2)
    print(f"Leakage report saved to {reports_dir}/leakage_report.json")

    # Clean missing / whitespace
    cleaned_df = df.copy()
    
    # Strip string columns
    for col in cleaned_df.select_dtypes(include=['object', 'string']).columns:
        cleaned_df[col] = cleaned_df[col].str.strip()

    # Drop ID and leakage columns for modeling
    model_df = cleaned_df.drop(columns=id_cols + leakage_cols)

    # Save processed full cleaned dataset
    cleaned_path = os.path.join(processed_dir, "cleaned_placement_data.csv")
    model_df.to_csv(cleaned_path, index=False)
    print(f"Cleaned dataset saved to {cleaned_path} ({model_df.shape[0]} rows, {model_df.shape[1]} cols)")

    # 2. Train/Test Stratified Split (80% / 20%)
    X = model_df.drop(columns=['status'])
    y = model_df['status']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    train_df = pd.concat([X_train, y_train], axis=1)
    test_df = pd.concat([X_test, y_test], axis=1)

    train_path = os.path.join(processed_dir, "train.csv")
    test_path = os.path.join(processed_dir, "test.csv")

    train_df.to_csv(train_path, index=False)
    test_df.to_csv(test_path, index=False)

    print(f"Train set saved: {train_df.shape[0]} rows ({train_path})")
    print(f"Test set saved: {test_df.shape[0]} rows ({test_path})")

if __name__ == "__main__":
    clean_and_split()
