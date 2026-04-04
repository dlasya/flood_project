
import os

class Config:
    DEBUG = True
    TESTING = False
    JSON_SORT_KEYS = False

class DevelopmentConfig(Config):
    FLASK_ENV = 'development'
    MODEL_PATH = os.path.join('models', 'flood_model.pkl')

class ProductionConfig(Config):
    DEBUG = False
    FLASK_ENV = 'production'

config = DevelopmentConfig()