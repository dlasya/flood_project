from flask import Flask, jsonify
from flask_cors import CORS
import os

from routes.auth import auth_bp

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

# Register lightweight/auth routes immediately
app.register_blueprint(auth_bp, url_prefix="/api/auth")
print("Auth routes registered at /api/auth")

# Try to register prediction routes. Those depend on ML libraries which
# may not be available in the current environment (for example scikit-learn).
# Registering them is best-effort so the API can still start for basic checks.
try:
    from routes.predictions import predictions_bp
    app.register_blueprint(predictions_bp, url_prefix="/api/predictions")
    print("Prediction routes registered at /api/predictions")
except Exception as e:
    print("Warning: prediction routes not available:", e)

@app.route('/')
def home():
    return jsonify({
        "status": "Online",
        "message": "Flood Risk Prediction API is Running",
        "endpoints": ["/api/predictions/predict", "/api/auth/login", "/api/auth/signup"]
    })

if __name__ == '__main__':
    # Default to 5000 so it matches the frontend,
    # but allow override with PORT env var if needed.
    port = int(os.environ.get("PORT", "5000"))
    print("\n--- SERVER STARTING ---")
    print(f"Access your API at: http://localhost:{port}")
    app.run(debug=True, host='0.0.0.0', port=port)