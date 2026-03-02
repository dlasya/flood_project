from flask import Blueprint, request, jsonify
from utils.ml_engine import ml_engine
import os
import pandas as pd

predictions_bp = Blueprint('predictions', __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
ZIPCODES_CSV = os.path.join(PROJECT_ROOT, "zipcodes.csv")
LABELED_DATASET_CSV = os.path.join(PROJECT_ROOT, "dataset", "master_dataset_with_labels.csv")

_zipcodes_df = None
_labeled_df = None


def _load_zipcodes():
    global _zipcodes_df
    if _zipcodes_df is None:
        df = pd.read_csv(ZIPCODES_CSV)
        df["statename_norm"] = df["statename"].str.strip().str.upper()
        _zipcodes_df = df[df["statename_norm"].isin(["TELANGANA", "ANDHRA PRADESH"])].copy()
    return _zipcodes_df


def _load_labeled():
    global _labeled_df
    if _labeled_df is None:
        df = pd.read_csv(LABELED_DATASET_CSV)
        _labeled_df = df
    return _labeled_df


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

    Uses zipcodes.csv to map pincode -> (district, state) for Telangana / Andhra Pradesh only,
    then aggregates the labeled dataset for that district to build inputs for the ML engine.
    """
    try:
        data = request.get_json()
        raw_pin = str(data.get("pincode") or "").strip()
        if not raw_pin.isdigit() or len(raw_pin) != 6:
            return jsonify({"error": "Invalid pincode"}), 400

        pin_int = int(raw_pin)

        zips = _load_zipcodes()
        match = zips[zips["pincode"] == pin_int]
        if match.empty:
            return jsonify({"error": "Pincode not found in Telangana or Andhra Pradesh"}), 404

        # Take the first matching office entry
        row = match.iloc[0]
        district_name = str(row["district"]).strip()
        state_name_upper = str(row["statename"]).strip().upper()
        state_name = "Telangana" if state_name_upper == "TELANGANA" else "Andhra Pradesh"

        labeled = _load_labeled()
        sub = labeled[
            (labeled["District"].str.strip().str.upper() == district_name.upper())
            & (labeled["State"].str.strip().str.upper() == state_name.upper())
        ]

        if sub.empty:
            return jsonify({"error": "No training data found for this district"}), 404

        # Aggregate features for ML input
        rainfall = float(sub["Monsoon_Rainfall_mm"].mean())
        drainage_enc = float(sub["Drainage_Quality_Enc"].mean())
        perm_mmhr = float(sub["Permeability_mm_per_hr"].mean())
        urban_percent = float(sub["Urban_Percent"].mean())
        breach_hist = int(round(sub["Breach_History_Enc"].mean()))
        elevation = float(sub["Mean_Elevation_m"].mean())

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
        elif drainage_enc >= 1.5:
            drainage_condition = 2
        elif drainage_enc >= 0.5:
            drainage_condition = 3
        else:
            drainage_condition = 4

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
        }), 200

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500
