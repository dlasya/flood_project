from flask import Blueprint, request, jsonify
from app import db
from database.db_models import UrbanParameter

parameters_bp = Blueprint('parameters', __name__, url_prefix='/api/parameters')

@parameters_bp.route('/update', methods=['POST'])
def update_parameters():
    try:
        data = request.get_json()
        pin_code = data.get('pin_code')
        
        if not pin_code:
            return {'error': 'pin_code is required'}, 400
        
        existing = UrbanParameter.query.filter_by(pin_code=pin_code).first()
        
        if existing:
            existing.rainfall_intensity = float(data.get('rainfall_intensity', existing.rainfall_intensity))
            existing.drainage_condition = data.get('drainage_condition', existing.drainage_condition)
            existing.soil_permeability = data.get('soil_permeability', existing.soil_permeability)
            existing.land_use_type = data.get('land_use_type', existing.land_use_type)
            existing.historical_flood_records = float(data.get('historical_flood_records', existing.historical_flood_records))
            existing.elevation = float(data.get('elevation', existing.elevation))
        else:
            existing = UrbanParameter(
                pin_code=pin_code,
                rainfall_intensity=float(data.get('rainfall_intensity', 0)),
                drainage_condition=data.get('drainage_condition', 'moderate'),
                soil_permeability=data.get('soil_permeability', 'moderate'),
                land_use_type=data.get('land_use_type', 'residential'),
                historical_flood_records=float(data.get('historical_flood_records', 0)),
                elevation=float(data.get('elevation', 0))
            )
            db.session.add(existing)
        
        db.session.commit()
        return existing.to_dict(), 200
    
    except Exception as e:
        db.session.rollback()
        return {'error': str(e)}, 500

@parameters_bp.route('/get/<pin_code>', methods=['GET'])
def get_parameters(pin_code):
    try:
        params = UrbanParameter.query.filter_by(pin_code=pin_code).first()
        
        if not params:
            return {'error': 'Parameters not found'}, 404
        
        return params.to_dict(), 200
    
    except Exception as e:
        return {'error': str(e)}, 500

@parameters_bp.route('/all', methods=['GET'])
def get_all_parameters():
    try:
        params = UrbanParameter.query.all()
        return [p.to_dict() for p in params], 200
    
    except Exception as e:
        return {'error': str(e)}, 500
