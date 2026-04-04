from app import db
from datetime import datetime

class FloodRiskPrediction(db.Model):
    __tablename__ = 'flood_predictions'
    
    id = db.Column(db.Integer, primary_key=True)
    pin_code = db.Column(db.String(10), nullable=False)
    location_name = db.Column(db.String(255), nullable=False)
    rainfall_intensity = db.Column(db.Float, nullable=False)
    drainage_condition = db.Column(db.String(50), nullable=False)
    soil_permeability = db.Column(db.String(50), nullable=False)
    land_use_type = db.Column(db.String(50), nullable=False)
    historical_flood_records = db.Column(db.Float, nullable=False)
    elevation = db.Column(db.Float, nullable=True)
    
    risk_score = db.Column(db.Float, nullable=False)
    risk_level = db.Column(db.String(20), nullable=False)
    prediction_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'pin_code': self.pin_code,
            'location_name': self.location_name,
            'risk_score': self.risk_score,
            'risk_level': self.risk_level,
            'prediction_date': self.prediction_date.isoformat()
        }


class UrbanParameter(db.Model):
    __tablename__ = 'urban_parameters'
    
    id = db.Column(db.Integer, primary_key=True)
    pin_code = db.Column(db.String(10), unique=True, nullable=False)
    rainfall_intensity = db.Column(db.Float, nullable=False)
    drainage_condition = db.Column(db.String(50), nullable=False)
    soil_permeability = db.Column(db.String(50), nullable=False)
    land_use_type = db.Column(db.String(50), nullable=False)
    historical_flood_records = db.Column(db.Float, nullable=False)
    elevation = db.Column(db.Float, nullable=True)
    updated_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'pin_code': self.pin_code,
            'rainfall_intensity': self.rainfall_intensity,
            'drainage_condition': self.drainage_condition,
            'soil_permeability': self.soil_permeability,
            'land_use_type': self.land_use_type,
            'historical_flood_records': self.historical_flood_records,
            'elevation': self.elevation
        }
