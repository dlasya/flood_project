from flask import Blueprint

def init_routes(app):
    from routes.predictions import predictions_bp
    app.register_blueprint(predictions_bp, url_prefix='/api/predictions')