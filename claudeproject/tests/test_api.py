import unittest
import json
import os
import sys
# ensure the parent directory is on sys.path so we can import app module
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
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

    def test_signup_and_forgot_password_user(self):
        # sign up new regular user
        payload = {
            'fullName': 'Test User',
            'userId': 'test.user',
            'password': 'Password123',
            'district': 'TestDistrict',
            'state': 'TestState',
            'type': 'user',
        }
        res = self.app.post('/api/auth/signup', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertTrue(data.get('success'))
        self.assertEqual(data['user']['type'], 'user')
        self.assertEqual(data['user']['district'], 'TestDistrict')

        # forgot password should update password for this user
        res2 = self.app.post('/api/auth/forgot-password', data=json.dumps({'userId': 'test.user', 'newPassword': 'NewPass!'}), content_type='application/json')
        self.assertEqual(res2.status_code, 200)
        users = json.load(open(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'users.json')))
        self.assertEqual(users['test.user']['password'], 'NewPass!')

        # also verify planner password reset works
        planner_payload = {
            'fullName': 'Planner Test',
            'userId': 'planner.test',
            'password': 'PlanPass1',
            'type': 'planner',
            'access': 'DemoRegion'
        }
        res3 = self.app.post('/api/auth/signup', data=json.dumps(planner_payload), content_type='application/json')
        self.assertEqual(res3.status_code, 201)
        res4 = self.app.post('/api/auth/forgot-password', data=json.dumps({'userId': 'planner.test', 'newPassword': 'PlanPass2'}), content_type='application/json')
        self.assertEqual(res4.status_code, 200)
        users = json.load(open(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'users.json')))
        self.assertEqual(users['planner.test']['password'], 'PlanPass2')

    def test_signup_planner_requires_access(self):
        # attempt signup planner without access should fail
        payload = {
            'fullName': 'Planner One',
            'userId': 'planner.one',
            'password': 'Planner123',
            'type': 'planner'
        }
        res = self.app.post('/api/auth/signup', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(res.status_code, 400)

        # now sign up correctly
        payload['access'] = 'SomeRegion'
        res2 = self.app.post('/api/auth/signup', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(res2.status_code, 201)
        data2 = json.loads(res2.data)
        self.assertEqual(data2['user']['type'], 'planner')
        self.assertEqual(data2['user']['access'], 'SomeRegion')

if __name__ == '__main__':
    unittest.main()
