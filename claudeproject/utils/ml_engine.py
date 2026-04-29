import os
from dataclasses import dataclass
from typing import Dict, List

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression


@dataclass
class PredictionOutput:
    """
    A structured output object for predictions.
    """

    risk_level: str
    risk_score: float
    confidence: float
    waterlogging_days: float


class MLEngine:
    """
    MLEngine (Megadataset-backed)
    ----------------------------
    This class trains/loads models using your real dataset in `megadataset/`
    and uses them for prediction.

    We keep the backend lightweight:
    - If model files exist, we load them once and reuse.
    - If model files are missing, we train them from the megadataset once
      and save them into `claudeproject/models/`.
    """

    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # .../claudeproject
        project_root = os.path.abspath(os.path.join(base_dir, ".."))  # .../flood_project

        self.dataset_path = os.path.join(
            project_root, "megadataset", "master_dataset_model_ready.csv"
        )

        self.models_dir = os.path.join(base_dir, "models")
        self.severity_model_path = os.path.join(self.models_dir, "rf_severity_6feat.pkl")
        self.waterlogging_model_path = os.path.join(self.models_dir, "lr_waterlogging_6feat.pkl")

        self.severity_model: RandomForestClassifier | None = None
        self.waterlogging_model: LinearRegression | None = None

        # These are the feature columns we can reliably derive from the dataset
        # and also map from the frontend input fields.
        self.feature_cols = [
            "Monsoon_Rainfall_mm",      # rainfall_intensity
            "Drainage_Quality_Enc",     # drainage_condition (mapped)
            "Permeability_mm_per_hr",   # soil_permeability (mapped)
            "Urban_Percent",            # land_use_type (mapped)
            "Breach_History_Enc",       # historical_flood_records
            "Mean_Elevation_m",         # elevation
        ]

    def _ensure_models(self) -> None:
        """
        Ensure models are available.

        If model pickle files exist -> load.
        Else -> train from megadataset and save.
        """
        if self.severity_model is not None and self.waterlogging_model is not None:
            return

        os.makedirs(self.models_dir, exist_ok=True)

        if os.path.exists(self.severity_model_path) and os.path.exists(self.waterlogging_model_path):
            print(f"[MLEngine] Loading models from: {self.models_dir}")
            self.severity_model = joblib.load(self.severity_model_path)
            self.waterlogging_model = joblib.load(self.waterlogging_model_path)
            return

        # Train from the real megadataset
        if not os.path.exists(self.dataset_path):
            raise FileNotFoundError(
                f"Megadataset not found at {self.dataset_path}. "
                f"Please ensure megadataset/master_dataset_model_ready.csv exists."
            )

        print(f"[MLEngine] Training models from megadataset: {self.dataset_path}")
        df = pd.read_csv(self.dataset_path)

        required = set(self.feature_cols + ["Flood_Severity_Enc", "Waterlogging_Days"])
        missing = [c for c in required if c not in df.columns]
        if missing:
            raise ValueError(
                f"Megadataset is missing required columns for training: {missing}"
            )

        X = df[self.feature_cols].copy()
        X = X.fillna(X.median(numeric_only=True))

        y_severity = df["Flood_Severity_Enc"].fillna(0).astype(int)
        y_water_days = df["Waterlogging_Days"].fillna(0)

        severity_model = RandomForestClassifier(n_estimators=200, random_state=42)
        severity_model.fit(X, y_severity)

        waterlogging_model = LinearRegression()
        waterlogging_model.fit(X, y_water_days)

        joblib.dump(severity_model, self.severity_model_path)
        joblib.dump(waterlogging_model, self.waterlogging_model_path)

        self.severity_model = severity_model
        self.waterlogging_model = waterlogging_model

        print(f"[MLEngine] Saved models to: {self.models_dir}")

    @staticmethod
    def _map_drainage_condition_to_enc(drainage_condition: int) -> int:
        """
        Map a 1..5 drainage condition (1=Good, 5=Poor) into a 0..3 encoded value.
        """
        dc = int(drainage_condition)
        if dc <= 1:
            return 3
        if dc == 2:
            return 2
        if dc == 3:
            return 1
        return 0

    @staticmethod
    def _map_land_use_to_urban_percent(land_use_type: int) -> float:
        """
        Map land use type (1=rural, 2=semi-urban, 3=urban) to a rough Urban_Percent.
        """
        lut = int(land_use_type)
        if lut <= 1:
            return 20.0
        if lut == 2:
            return 50.0
        return 80.0

    @staticmethod
    def _map_soil_perm_to_mmhr(soil_permeability: float) -> float:
        """
        Map a 0..1 soil permeability input to a plausible Permeability_mm_per_hr.
        """
        sp = float(soil_permeability)
        sp = max(0.0, min(1.0, sp))
        return sp * 50.0

    def predict(
        self,
        rainfall_intensity: float,
        drainage_condition: int,
        soil_permeability: float,
        land_use_type: int,
        historical_flood_records: int,
        elevation: float,
    ) -> PredictionOutput:
        """
        Predict flood severity class + risk score + waterlogging days.

        Returns values designed to integrate cleanly with the frontend.
        """
        self._ensure_models()
        assert self.severity_model is not None
        assert self.waterlogging_model is not None

        # Create features using the 6 features we can actually provide
        urban_percent = self._map_land_use_to_urban_percent(land_use_type)
        drainage_enc = self._map_drainage_condition_to_enc(drainage_condition)
        
        features_row = pd.DataFrame([{
            "Monsoon_Rainfall_mm": float(rainfall_intensity),
            "Drainage_Quality_Enc": drainage_enc,
            "Permeability_mm_per_hr": self._map_soil_perm_to_mmhr(soil_permeability),
            "Urban_Percent": urban_percent,
            "Breach_History_Enc": int(historical_flood_records),
            "Mean_Elevation_m": float(elevation),
        }])

        proba = self.severity_model.predict_proba(features_row)[0]
        pred_class = int(np.argmax(proba))

        # Risk score is computed as probability of being High/Extreme (classes 2 or 3),
        # which gives a useful 0..1 value for a gauge/progress bar.
        high_extreme_score = float(proba[2] + (proba[3] if len(proba) > 3 else 0.0))
        confidence = float(np.max(proba))

        level_map = {0: "Low", 1: "Moderate", 2: "High", 3: "Extreme"}
        risk_level = level_map.get(pred_class, "Moderate")

        water_days = float(self.waterlogging_model.predict(features_row)[0])
        water_days = max(0.0, water_days)

        return PredictionOutput(
            risk_level=risk_level,
            risk_score=high_extreme_score,
            confidence=confidence,
            waterlogging_days=water_days,
        )


ml_engine = MLEngine()