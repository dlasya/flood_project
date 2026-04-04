

import os

class Config:
    DEBUG = True
    TESTING = False
    JSON_SORT_KEYS = False

class DevelopmentConfig(Config):
    FLASK_ENV = 'development'
    MODEL_PATH = os.path.join('models', 'flood_model.pkl')
    # Dataset paths for flood prediction
    PINCODES_CSV = 'dataset/telangana_andhra_pincodes.csv'
    LABELED_DATASET_CSV = 'dataset/master_dataset_with_labels.csv'
    SOIL_ACCURATE_CSV = 'dataset/soil_type_accurate.csv'
    DISTRICT_DIST_CSV = 'dataset/district_distribution_statewise_cleaned.csv'
    MEGADATASET_CSV = 'megadataset/master_dataset_model_ready.csv'

class ProductionConfig(Config):
    DEBUG = False
    FLASK_ENV = 'production'
    # Dataset paths for flood prediction
    PINCODES_CSV = 'dataset/telangana_andhra_pincodes.csv'
    LABELED_DATASET_CSV = 'dataset/master_dataset_with_labels.csv'
    SOIL_ACCURATE_CSV = 'dataset/soil_type_accurate.csv'
    DISTRICT_DIST_CSV = 'dataset/district_distribution_statewise_cleaned.csv'
    MEGADATASET_CSV = 'megadataset/master_dataset_model_ready.csv'

config = DevelopmentConfig()