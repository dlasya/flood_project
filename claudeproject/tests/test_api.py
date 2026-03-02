import unittest
import json
from app import app

class TestFloodPredictionAPI(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
    
    def test_predict_endpoint(self):
        payload = {
            'location_name': 'Test City',
            'pin_code': '123456',
            'rainfall_intensity': 150,
            'drainage_condition': 5,
            'soil_permeability': 0.1,
            'land_use_type': 3,
            'historical_flood_records': 1,
            'elevation': 5
        }
        response = self.app.post('/api/predictions/predict',
                                 data=json.dumps(payload),
                                 content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('risk_level', data)
        self.assertIn('confidence', data)

if __name__ == '__main__':
    unittest.main()
