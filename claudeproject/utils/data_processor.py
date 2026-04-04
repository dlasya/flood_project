class DataProcessor:
    @staticmethod
    def validate_input(data):
        required_fields = [
            'location_name', 'rainfall_intensity', 'drainage_condition',
            'soil_permeability', 'land_use_type', 'historical_flood_records', 'elevation'
        ]
        
        for field in required_fields:
            if field not in data:
                raise ValueError(f"Missing required field: {field}")
        
        return True
    
    @staticmethod
    def normalize_features(data):
        return [
            float(data['rainfall_intensity']),
            int(data['drainage_condition']),
            float(data['soil_permeability']),
            int(data['land_use_type']),
            int(data['historical_flood_records']),
            float(data['elevation'])
        ]
