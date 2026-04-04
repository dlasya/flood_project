from app import app
import json

client = app.test_client()
payload={'fullName':'Planner One','userId':'planner.one','password':'Planner123','type':'planner','access':'SomeRegion'}
res = client.post('/api/auth/signup', data=json.dumps(payload), content_type='application/json')
print('status', res.status_code)
print('body', res.get_data(as_text=True))
