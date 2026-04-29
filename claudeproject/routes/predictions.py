from flask import Blueprint, request, jsonify
from utils.ml_engine import ml_engine
from routes.issues import _calculate_impact_score, _read_issues
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
        # For now, filter to Telangana and Andhra Pradesh to match existing ML data
        # Can be expanded later when ML data is available for all states
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
        district_name = str(row["Districtname"]).strip()
        state_name_upper = str(row["statename"]).strip().upper()
        state_name = "Telangana" if state_name_upper == "TELANGANA" else "Andhra Pradesh"
        
        # Map district names to match the labeled dataset and correct geographical errors
        district_mapping = {
            # Andhra Pradesh
            "SPSR NELLORE": "Nellore",
            "NTR": "Krishna",
            "NANDYAL": "Kurnool", 
            "Y.S.R.": "Kadapa",
            "ANNAMAYYA": "Kadapa",
            "KAKINADA": "East Godavari",
            "PALNADU": "Guntur",
            "VISAKHAPATANAM": "Visakhapatnam",
            "ANANTHAPUR": "Anantapur",
            "CUDDAPAH": "Kadapa",
            "ANAKAPALLI": "Anakapalli",
            "BAPATLA": "Bapatla",
            "DR. B.R. AMBEDKAR KONASEEMA": "Konaseema",
            "PARVATHIPURAM MANYAM": "Parvathipuram Manyam",
            "SRI SATHYA SAI": "Sri Sathya Sai",
            "TIRUPATI": "Tirupati",
            "VIZIANAGARAM": "Vizianagaram",
            "WEST GODAVARI": "West Godavari",
            "ELURU": "Eluru",
            
            # Telangana - Corrected geographical mappings
            "RANGA REDDY": "Rangareddy",
            "K.V.RANGAREDDY": "Rangareddy",
            "HANUMAKONDA": "Hanamkonda", 
            "JANGOAN": "Jangaon",
            "JAGITIAL": "Jagtial",
            "JOGULAMBA GADWAL": "Gadwal",
            "KUMURAM BHEEM ASIFABAD": "Kumuram Bheem",
            "JAYASHANKAR BHUPALAPALLY": "Jayashankar Bhupalpally",
            "KARIM NAGAR": "Karimnagar",
            "MAHABUB NAGAR": "Mahabubnagar",
            "ADILABAD": "Adilabad",
            "ASIFABAD": "Asifabad",
            "BHADRADRI KOTHAGUDEM": "Bhadradri Kothagudem",
            "KAMAREDDY": "Kamareddy",
            "KHAMMAM": "Khammam",
            "MAHABUBABAD": "Mahabubabad",
            "MANCHERIAL": "Mancherial",
            "MEDAK": "Medak",
            "MULUGU": "Mulugu",
            "NAGARKURNOOL": "Nagarkurnool",
            "NALGONDA": "Nalgonda",
            "NARAYANPET": "Narayanpet",
            "NIRMAL": "Nirmal",
            "NIZAMABAD": "Nizamabad",
            "PEDDAPALLI": "Peddapalli",
            "RAJANNA SIRICILLA": "Rajanna Sircilla",
            "SANGAREDDY": "Sangareddy",
            "SIDDIPET": "Siddipet",
            "SURYAPET": "Suryapet",
            "VIKARABAD": "Vikarabad",
            "WANAPARTHY": "Wanaparthy",
            "WARANGAL": "Warangal",
            "WARANGAL (RURAL)": "Warangal",
            "WARANGAL (URBAN)": "Warangal",
            "YADADRI BHUVANAGIRI": "Yadadri Bhuvanagiri",
            
            # Hyderabad area corrections - map to Hyderabad district for accuracy
            "MEDCHAL MALKAJGIRI": "Medchal Malkajgiri"
        }
        
        # Special case: Hyderabad area pincodes that should map to Hyderabad district
        hyderabad_pincodes = [500018, 500010, 500013]  # KPHB, Kukatpally and other Hyderabad areas
        
        # For pincode 500018, prioritize Hyderabad district if available
        if pin_int == 500018:
            # Check if Hyderabad entry exists for this pincode
            hyderabad_entries = match[match["Districtname"].str.contains("Hyderabad", case=False, na=False)]
            if not hyderabad_entries.empty:
                mapped_district = "Hyderabad"
            else:
                # If no Hyderabad entry, use mapped district (K.V.Rangareddy -> Rangareddy)
                mapped_district = district_mapping.get(district_name.upper(), district_name)
        elif pin_int in hyderabad_pincodes:
            mapped_district = "Hyderabad"
        else:
            mapped_district = district_mapping.get(district_name.upper(), district_name)

        labeled = _load_labeled()
        sub = labeled[
            (labeled["District"].str.strip().str.upper() == mapped_district.upper())
            & (labeled["State"].str.strip().str.upper() == state_name.upper())
        ]

        if sub.empty:
            return jsonify({"error": "No training data found for this district"}), 404

        # Use recent years data for current situation analysis
        max_year = sub["Year"].max()
        recent_years = [max_year, max_year - 1, max_year - 2]  # Last 3 years
        recent_sub = sub[sub["Year"].isin(recent_years)]
        
        # If recent data is insufficient, fall back to all available data
        if len(recent_sub) < 3:
            recent_sub = sub
        
        # Apply time-weighting (more recent = higher weight)
        weights = {}
        for year in recent_sub["Year"].unique():
            # Recent years get higher weights
            if year == max_year:
                weights[year] = 3.0
            elif year == max_year - 1:
                weights[year] = 2.0
            else:
                weights[year] = 1.0
        
        # Aggregate features with time-weighting
        rainfall = 0.0
        drainage_enc = 0.0
        perm_mmhr = 0.0
        urban_percent = 0.0
        breach_hist = 0.0
        elevation = 0.0
        total_weight = 0.0
        
        for _, row in recent_sub.iterrows():
            weight = weights.get(row["Year"], 1.0)
            rainfall += row["Monsoon_Rainfall_mm"] * weight
            drainage_enc += row["Drainage_Quality_Enc"] * weight
            perm_mmhr += row["Permeability_mm_per_hr"] * weight
            urban_percent += row["Urban_Percent"] * weight
            breach_hist += row["Breach_History_Enc"] * weight
            elevation += row["Mean_Elevation_m"] * weight
            total_weight += weight
        
        # Calculate weighted averages
        rainfall = float(rainfall / total_weight)
        drainage_enc = float(drainage_enc / total_weight)
        perm_mmhr = float(perm_mmhr / total_weight)
        urban_percent = float(urban_percent / total_weight)
        breach_hist = int(round(breach_hist / total_weight))
        elevation = float(elevation / total_weight)

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

        # Get user-reported issues for this pincode
        try:
            issues = _read_issues()
            pincode_issues = [issue for issue in issues if issue['pincode'] == raw_pin]
            issue_impact_score = _calculate_impact_score(pincode_issues)
        except:
            issue_impact_score = 0

        result = ml_engine.predict(
            rainfall_intensity=rainfall,
            drainage_condition=drainage_condition,
            soil_permeability=soil_perm,
            land_use_type=land_use_type,
            historical_flood_records=history_flag,
            elevation=elevation,
        )

        base_flood_probability = float(result.risk_score)
        base_waterlogging_days = float(result.waterlogging_days)
        
        # Adjust predictions based on user-reported issues
        # Issue impact score (0-100) is converted to a multiplier (1.0 to 2.0)
        issue_multiplier = 1.0 + (issue_impact_score / 100.0)  # 1.0 to 2.0
        
        # Apply issue impact to flood probability
        flood_probability = min(base_flood_probability * issue_multiplier, 1.0)
        flood_risk_percent = int(round(flood_probability * 100))
        
        # Apply issue impact to waterlogging days
        waterlogging_days = base_waterlogging_days * issue_multiplier
        waterlogging_severity = (
            "Severe" if waterlogging_days > 15 else "Moderate" if waterlogging_days > 8 else "Low"
        )

        return jsonify({
            "pincode": raw_pin,
            "district": mapped_district.title(),
            "state": state_name,
            "location": f"{raw_pin}, {mapped_district.title()}, {state_name}",
            "risk_level": result.risk_level,
            "flood_risk_percent": flood_risk_percent,
            "flood_probability": flood_probability,
            "waterlogging_days": waterlogging_days,
            "waterlogging_severity": waterlogging_severity,
            "annual_rainfall": rainfall,
            "elevation": elevation,
            "soil_type": "Black Cotton" if soil_perm < 0.3 else "Alluvial" if soil_perm < 0.7 else "Sandy",
            "drainage_quality": "Good" if drainage_condition <= 2 else "Moderate" if drainage_condition <= 3 else "Poor",
            "issue_impact": {
                "score": issue_impact_score,
                "total_reports": len(pincode_issues),
                "issues": pincode_issues[-5:] if pincode_issues else [],
                "adjusted_risk": flood_risk_percent > int(round(base_flood_probability * 100)),
                "base_risk_percent": int(round(base_flood_probability * 100)),
                "risk_increase": flood_risk_percent - int(round(base_flood_probability * 100))
            }
        })

    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500
