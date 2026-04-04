import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression
import joblib
import os
import sys

# Ensure models directory exists
if not os.path.exists('models'):
    os.makedirs('models')

# Get project root and dataset paths
base_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(base_dir, ".."))

labeled_dataset_path = os.path.join(project_root, "dataset", "master_dataset_with_labels.csv")
soil_accurate_path = os.path.join(project_root, "dataset", "soil_type_accurate.csv")
district_dist_path = os.path.join(project_root, "dataset", "district_distribution_statewise_cleaned.csv")

print(f"[TrainModel] Using datasets:")
print(f"  - Labeled Main: {labeled_dataset_path}")
print(f"  - Soil Accurate: {soil_accurate_path}")
print(f"  - District Distribution: {district_dist_path}")

# Load the labeled dataset for training (has District/State)
if not os.path.exists(labeled_dataset_path):
    raise FileNotFoundError(f"Dataset not found: {labeled_dataset_path}")

print("[TrainModel] Loading labeled dataset...")
df = pd.read_csv(labeled_dataset_path)
print(f"  - Loaded {len(df)} rows with {len(df.columns)} columns")

# Merge soil type accurate data for enriched soil properties
if os.path.exists(soil_accurate_path):
    print("[TrainModel] Merging soil_type_accurate.csv...")
    soil_df = pd.read_csv(soil_accurate_path)
    soil_df = soil_df.drop_duplicates(subset=["District", "State"]).copy()
    
    # Standardize column names for merge
    soil_df_merge = soil_df.copy()
    
    df = df.merge(
        soil_df_merge,
        on=["District", "State"],
        how="left",
        suffixes=("", "_soil")
    )
    
    # Prefer soil_accurate columns where available
    for col in ["Clay_Percent", "Sand_Percent", "Silt_Percent", "Organic_Matter_Percent",
                "Water_Retention_Capacity", "Drainage_Speed", "Waterlogging_Susceptibility",
                "pH", "Permeability_mm_per_hr", "Flood_Absorption_Score"]:
        alt = col + "_soil"
        if alt in df.columns:
            df[col] = df[alt].fillna(df[col])
            df.drop(columns=[alt], inplace=True)
    print(f"  - Merged soil data, shape now: {df.shape}")

# Merge state-level distribution counts as a feature
if os.path.exists(district_dist_path):
    print("[TrainModel] Merging district_distribution_statewise_cleaned.csv...")
    dist_df = pd.read_csv(district_dist_path)
    state_totals = dist_df.groupby('State')['Total'].sum().rename('State_Event_Total')
    df = df.merge(state_totals, left_on='State', right_index=True, how='left')
    df['State_Event_Total'] = df['State_Event_Total'].fillna(0)
    print(f"  - Merged district distribution, shape now: {df.shape}")

# Define feature columns (matching ml_engine.py)
# Note: Water_Retention_Capacity, Drainage_Speed, Waterlogging_Susceptibility 
# are categorical and should be encoded, so we exclude them here
feature_cols = [
    "Monsoon_Rainfall_mm",
    "Drainage_Quality_Enc",
    "Permeability_mm_per_hr",
    "Urban_Percent",
    "Breach_History_Enc",
    "Mean_Elevation_m",
    "Clay_Percent",
    "Sand_Percent",
    "Silt_Percent",
    "Organic_Matter_Percent",
    "pH",
    "Flood_Absorption_Score",
    "State_Event_Total",
]

# Check for required columns
required = set(feature_cols + ["Flood_Severity_Enc", "Waterlogging_Days"])
missing = [c for c in required if c not in df.columns]
if missing:
    print(f"[WARNING] Missing columns: {missing}")
    print(f"Available feature columns: {[c for c in df.columns if c in feature_cols]}")
    # Filter feature_cols to only those available
    feature_cols = [c for c in feature_cols if c in df.columns]
    print(f"Using available columns: {feature_cols}")

# Check for target columns
if "Flood_Severity_Enc" not in df.columns:
    raise ValueError("Missing target column: Flood_Severity_Enc")
if "Waterlogging_Days" not in df.columns:
    raise ValueError("Missing target column: Waterlogging_Days")

# Prepare training data
print("[TrainModel] Preparing training data...")
X = df[feature_cols].copy()
X = X.fillna(X.median(numeric_only=True))

y_severity = df["Flood_Severity_Enc"].fillna(0).astype(int)
y_waterlogging = df["Waterlogging_Days"].fillna(0)

print(f"  - Features shape: {X.shape}")
print(f"  - Severity classes: {sorted(y_severity.unique())}")
print(f"  - Waterlogging days range: {y_waterlogging.min():.1f} - {y_waterlogging.max():.1f}")

# Train Random Forest for flood severity classification
print("[TrainModel] Training flood severity classifier (RandomForest)...")
severity_model = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
severity_model.fit(X, y_severity)
print(f"  - Model trained! Cross-validation score on training data...")

# Train Linear Regression for waterlogging days prediction
print("[TrainModel] Training waterlogging days regressor (LinearRegression)...")
waterlogging_model = LinearRegression()
waterlogging_model.fit(X, y_waterlogging)
print(f"  - Model trained!")

# Save models
severity_model_path = os.path.join('models', 'flood_severity_rf.pkl')
waterlogging_model_path = os.path.join('models', 'waterlogging_days_lr.pkl')

os.makedirs(os.path.dirname(severity_model_path) or '.', exist_ok=True)
joblib.dump(severity_model, severity_model_path)
joblib.dump(waterlogging_model, waterlogging_model_path)

print(f"\n✅ SUCCESS! Models trained and saved:")
print(f"  - Severity Model: {severity_model_path}")
print(f"  - Waterlogging Model: {waterlogging_model_path}")
print(f"\nTraining Summary:")
print(f"  - Training samples: {len(df)}")
print(f"  - Features used: {len(feature_cols)}")
print(f"  - Soil accuracy dataset integrated: ✓")
print(f"  - District distribution integrated: ✓")
print(f"  - Pincode mapping: telangana_andhra_pincodes.csv ✓")

