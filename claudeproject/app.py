from flask import Flask, jsonify
from flask_cors import CORS

from routes.predictions import predictions_bp
from routes.auth import auth_bp

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

app.register_blueprint(predictions_bp, url_prefix="/api/predictions")
app.register_blueprint(auth_bp, url_prefix="/api/auth")
print("Prediction routes registered at /api/predictions")
print("Auth routes registered at /api/auth")

@app.route('/')
def home():
    return jsonify({
        "status": "Online",
        "message": "Flood Risk Prediction API is Running",
        "endpoints": ["/api/predictions/predict", "/api/auth/login", "/api/auth/signup"]
    })

if __name__ == '__main__':
    port = 5001
    print("\n--- SERVER STARTING ---")
    print(f"Access your API at: http://localhost:{port}")
    app.run(debug=True, host='0.0.0.0', port=port)