from flask import Blueprint, request, jsonify
from utils.ml_engine import ml_engine
import os
import pandas as pd
import json
import time

predictions_bp = Blueprint('predictions', __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
# Use Telangana & Andhra Pradesh pincodes for regional focus
PINCODES_CSV = os.path.join(PROJECT_ROOT, "dataset", "telangana_andhra_pincodes.csv")
LABELED_DATASET_CSV = os.path.join(PROJECT_ROOT, "dataset", "master_dataset_with_labels.csv")
# Add new dataset paths
SOIL_ACCURATE_CSV = os.path.join(PROJECT_ROOT, "dataset", "soil_type_accurate.csv")
DISTRICT_DIST_CSV = os.path.join(PROJECT_ROOT, "dataset", "district_distribution_statewise_cleaned.csv")
DEBUG_LOG_PATH = os.path.join(PROJECT_ROOT, "debug-1a2913.log")

# region agent log
def _debug_log(hypothesis_id: str, message: str, data: dict) -> None:
    """
    Lightweight debug logger for by-pincode issues.
    Writes NDJSON lines to debug-1a2913.log at the project root.
    """
    try:
        payload = {
            "sessionId": "1a2913",
            "id": f"log_{int(time.time() * 1000)}",
            "timestamp": int(time.time() * 1000),
            "location": "routes/predictions.py:get_prediction_by_pincode",
            "message": message,
            "data": data,
            "runId": "run1",
            "hypothesisId": hypothesis_id,
        }
        with open(DEBUG_LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(payload) + "\n")
    except Exception:
        # Never let logging break the API
        pass
# endregion agent log

_pincodes_df = None
_labeled_df = None
_soil_df = None
_dist_df = None


def _load_pincodes():
    """
    Load Telangana & Andhra Pradesh pincodes CSV once.
    Provides regional focus on Telangana and Andhra Pradesh.
    """
    global _pincodes_df
    if _pincodes_df is None:
        df = pd.read_csv(PINCODES_CSV)
        df["statename_norm"] = df["statename"].str.strip().str.upper()
        _pincodes_df = df
    return _pincodes_df


def _load_labeled():
    global _labeled_df
    if _labeled_df is None:
        df = pd.read_csv(LABELED_DATASET_CSV)
        _labeled_df = df
    return _labeled_df


def _load_soil_accurate():
    global _soil_df
    if _soil_df is None:
        df = pd.read_csv(SOIL_ACCURATE_CSV)
        _soil_df = df
    return _soil_df


def _load_district_dist():
    global _dist_df
    if _dist_df is None:
        df = pd.read_csv(DISTRICT_DIST_CSV)
        _dist_df = df
    return _dist_df


@predictions_bp.route('/predict', methods=['POST'])
def get_prediction():
    """
    Endpoint: POST /api/predictions/predict
    Receives data from React frontend and returns flood risk prediction
    """
    try:
        data = request.get_json()
        
        # Extract parameters from frontend (matching your React form)
        rainfall = float(data.get('rainfall_intensity', 0))
        drainage = int(data.get('drainage_condition', 3))
        soil = float(data.get('soil_permeability', 0.5))
        land_use = int(data.get('land_use_type', 1))
        history = int(data.get('historical_flood_records', 0))
        elevation = float(data.get('elevation', 0))
        location = data.get('location_name', 'Unknown Location')
        
        # Call ML engine for prediction
        result = ml_engine.predict(
            rainfall_intensity=rainfall,
            drainage_condition=drainage,
            soil_permeability=soil,
            land_use_type=land_use,
            historical_flood_records=history,
            elevation=elevation,
        )

        # Convert the engine output into the richer format used by the FloodSense UI.
        flood_probability = float(result.risk_score)
        flood_risk_percent = int(round(flood_probability * 100))
        waterlogging_days = float(result.waterlogging_days)
        waterlogging_severity = (
            "Severe" if waterlogging_days > 15 else "Moderate" if waterlogging_days > 8 else "Low"
        )
        
        # Return response in format your React expects
        return jsonify({
            'location': location,
            'risk_level': result.risk_level,
            'risk_score': flood_probability,
            'confidence': float(result.confidence),
            'waterlogging_days': waterlogging_days,
            'waterlogging_severity': waterlogging_severity,
            'flood_risk_percent': flood_risk_percent,
            'flood_probability': flood_probability,
            'flood_severity': result.risk_level,
            'message': f"Flood risk for {location} is {result.risk_level}"
        }), 200
        
    except ValueError as e:
        return jsonify({'error': f'Invalid input data: {str(e)}'}), 400
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500


@predictions_bp.route('/by-pincode', methods=['POST'])
def get_prediction_by_pincode():
    """
    Endpoint: POST /api/predictions/by-pincode
    Body: { pincode }

    Uses zipcodes.csv to map pincode -> (district, state) for any state,
    then aggregates the labeled dataset for that district (or falls back
    to state-level data) to build inputs for the ML engine.
    """
    try:
        data = request.get_json()
        raw_pin = str(data.get("pincode") or "").strip()
        _debug_log("H1", "by_pincode_request", {"raw_pin": raw_pin})
        if not raw_pin.isdigit() or len(raw_pin) != 6:
            return jsonify({"error": "Invalid pincode"}), 400

        pin_int = int(raw_pin)

        pincodes = _load_pincodes()
        match = pincodes[pincodes["pincode"] == pin_int]
        _debug_log("H1", "zip_match", {"pin": pin_int, "match_rows": int(match.shape[0])})
        if match.empty:
            return jsonify({"error": "Pincode not found in Telangana/Andhra Pradesh pincodes database"}), 404

        # Take the first matching office entry
        row = match.iloc[0]
        district_name = str(row["district"]).strip()
        state_name_raw = str(row["statename"]).strip()
        # Use title-cased state name (e.g. "Telangana", "Andhra Pradesh", "Karnataka")
        state_name = state_name_raw.title()
        _debug_log(
            "H2",
            "district_state_resolved",
            {"district": district_name, "state": state_name},
        )

        labeled = _load_labeled()
        sub = labeled[
            (labeled["District"].str.strip().str.upper() == district_name.upper())
            & (labeled["State"].str.strip().str.upper() == state_name.upper())
        ]
        _debug_log(
            "H2",
            "district_dataset_rows",
            {"district": district_name, "state": state_name, "rows": int(sub.shape[0])},
        )

        # If we don't have district-level rows, fall back to aggregating
        # at state level so that all pincodes in Telangana/Andhra that
        # appear in zipcodes.csv can still get a prediction.
        if sub.empty:
            _debug_log(
                "H2",
                "district_dataset_empty_falling_back_to_state",
                {"district": district_name, "state": state_name},
            )
            state_only = labeled[
                labeled["State"].str.strip().str.upper() == state_name.upper()
            ]
            _debug_log(
                "H2",
                "state_dataset_rows",
                {"state": state_name, "rows": int(state_only.shape[0])},
            )
            if state_only.empty:
                return jsonify({"error": "No training data found for this state"}), 404
            sub = state_only

        # Merge in soil type data from soil_type_accurate
        soil_df = _load_soil_accurate()
        soil_match = soil_df[
            (soil_df["District"].str.strip().str.upper() == district_name.upper())
            & (soil_df["State"].str.strip().str.upper() == state_name.upper())
        ]
        if not soil_match.empty:
            soil_type = str(soil_match.iloc[0]["Soil_Type"])
        else:
            soil_type = "Unknown"

        # Aggregate features for ML input
        rainfall = float(sub["Monsoon_Rainfall_mm"].mean())
        drainage_enc = float(sub["Drainage_Quality_Enc"].mean())
        perm_mmhr = float(sub["Permeability_mm_per_hr"].mean())
        urban_percent = float(sub["Urban_Percent"].mean())
        breach_hist = int(round(sub["Breach_History_Enc"].mean()))
        elevation = float(sub["Mean_Elevation_m"].mean())
        
        _debug_log(
            "H3",
            "features_for_ml",
            {
                "district": district_name,
                "state": state_name,
                "rainfall": rainfall,
                "drainage_enc": drainage_enc,
                "perm_mmhr": perm_mmhr,
                "urban_percent": urban_percent,
                "breach_hist": breach_hist,
                "elevation": elevation,
                "soil_type": soil_type,
            },
        )

        # Approximate inverses to the mappings used in MLEngine
        # Soil permeability 0..1 from mm/hr (0..50)
        soil_perm = max(0.0, min(1.0, perm_mmhr / 50.0))

        # Land use type from Urban_Percent
        if urban_percent <= 30:
            land_use_type = 1
        elif urban_percent <= 65:
            land_use_type = 2
        else:
            land_use_type = 3

        # Drainage condition 1 (good) .. 5 (poor) from encoded value (0..3)
        # Rough inverse: higher enc => better, so map back to mid-scale
        if drainage_enc >= 2.5:
            drainage_condition = 1
            drainage_quality = "Good"
        elif drainage_enc >= 1.5:
            drainage_condition = 2
            drainage_quality = "Moderate"
        elif drainage_enc >= 0.5:
            drainage_condition = 3
            drainage_quality = "Fair"
        else:
            drainage_condition = 4
            drainage_quality = "Poor"

        history_flag = 1 if breach_hist >= 1 else 0

        result = ml_engine.predict(
            rainfall_intensity=rainfall,
            drainage_condition=drainage_condition,
            soil_permeability=soil_perm,
            land_use_type=land_use_type,
            historical_flood_records=history_flag,
            elevation=elevation,
        )

        flood_probability = float(result.risk_score)
        flood_risk_percent = int(round(flood_probability * 100))
        waterlogging_days = float(result.waterlogging_days)
        waterlogging_severity = (
            "Severe" if waterlogging_days > 15 else "Moderate" if waterlogging_days > 8 else "Low"
        )

        return jsonify({
            "pincode": raw_pin,
            "district": district_name.title(),
            "state": state_name,
            "location": f"{raw_pin}, {district_name.title()}, {state_name}",
            "risk_level": result.risk_level,
            "risk_score": flood_probability,
            "confidence": float(result.confidence),
            "waterlogging_days": waterlogging_days,
            "waterlogging_severity": waterlogging_severity,
            "flood_risk_percent": flood_risk_percent,
            "flood_probability": flood_probability,
            "flood_severity": result.risk_level,
            "annual_rainfall": round(rainfall, 2),
            "elevation": round(elevation, 2),
            "soil_type": soil_type,
            "drainage_quality": drainage_quality,
        }), 200

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500
