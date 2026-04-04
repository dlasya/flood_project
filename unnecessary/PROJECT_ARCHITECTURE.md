# Flood Project Architecture & Data Flow

## 📁 Project Structure

```
flood_project2/
└── flood_project/                          ← Main Project Root
    ├── claudeproject/                      ← BACKEND (Flask API)
    │   ├── app.py                          ← Flask server (runs on port 5000)
    │   ├── config.py                       ← Configuration & dataset paths
    │   ├── train_model.py                  ← Model training script
    │   ├── requirements.txt                ← Python dependencies
    │   ├── models/                         ← Trained ML Models
    │   │   ├── flood_severity_rf.pkl       ← RandomForest classifier (5MB)
    │   │   ├── waterlogging_days_lr.pkl    ← Linear Regression model
    │   │   └── flood_model.pkl             ← Legacy model
    │   ├── routes/                         ← API Endpoints
    │   │   ├── auth.py                     ← Login/Signup endpoints
    │   │   └── predictions.py              ← Flood prediction endpoints
    │   ├── utils/                          ← Utilities
    │   │   ├── ml_engine.py                ← ML prediction engine
    │   │   ├── data_processor.py           ← Data processing logic
    │   │   └── __init__.py
    │   └── __pycache__/                    ← Compiled Python files
    │
    ├── Flood new/                          ← FRONTEND (React + Vite)
    │   ├── src/                            ← React source code
    │   ├── components/                     ← React components
    │   │   └── LocationProfileCard.jsx     ← Displays rainfall, elevation, soil, drainage
    │   ├── index.html                      ← Entry HTML
    │   ├── main.jsx                        ← React entry point
    │   ├── UserDashboard.jsx               ← Main user interface
    │   ├── package.json                    ← NPM dependencies
    │   ├── vite.config.js                  ← Vite configuration
    │   ├── dist/                           ← Compiled frontend (for production)
    │   └── node_modules/                   ← NPM packages
    │
    ├── dataset/                            ← PRIMARY DATASETS
    │   ├── telangana_andhra_pincodes.csv   ← 16,936 pincodes (Telangana & AP)
    │   │                                      Columns: pincode, district, state, district, etc.
    │   │
    │   ├── master_dataset_with_labels.csv  ← 550 records (labeled training data)
    │   │                                      Columns: District, State, Monsoon_Rainfall_mm,
    │   │                                      Drainage_Quality_Enc, Mean_Elevation_m, etc.
    │   │
    │   ├── soil_type_accurate.csv          ← 57 district-state combinations
    │   │                                      Columns: District, State, Soil_Type, Clay_Percent,
    │   │                                      Sand_Percent, Silt_Percent, pH, Permeability_mm_per_hr,
    │   │                                      Flood_Absorption_Score, etc.
    │   │
    │   ├── district_distribution_statewise_cleaned.csv  ← State-level flood statistics
    │   │                                                    Columns: State, Total (flood events)
    │   │
    │   ├── rainfall_2025.csv               ← Recent rainfall data
    │   ├── elevation_dem.csv               ← Digital elevation model
    │   ├── drainage_capacity.csv           ← Drainage specifications
    │   ├── population_density.csv          ← Population distribution
    │   ├── river_waterbody_proximity.csv   ← Geographic features
    │   ├── slope_runoff_coefficient.csv    ← Terrain characteristics
    │   └── [other supplementary CSVs]
    │
    ├── megadataset/                        ← TRAINING DATASET
    │   ├── master_dataset_model_ready.csv  ← 550 records (processed for ML)
    │   │                                      77 columns with all engineered features
    │   │                                      Used for model training
    │   └── zipcodes.csv                    ← All India pincodes (backup)
    │
    └── flood-risk-frontend/                ← Alternative UI (optional)
```

---

## 🔗 Data Flow & Connections

### **1️⃣ MODEL TRAINING PIPELINE**
```
┌─────────────────────────────────────────┐
│  dataset/master_dataset_with_labels.csv │  ← Main training data (550 rows)
│  (District, State, Rainfall, etc.)      │
└──────────────┬──────────────────────────┘
               │
               ├─→ Merged with ↓
               │
        ┌──────────────────────────────────┐
        │ dataset/soil_type_accurate.csv    │  ← Soil properties
        │ (Clay%, Sand%, Silt%, pH, etc.)   │
        └──────────────┬───────────────────┘
               │
               │
               ├─→ Merged with ↓
               │
        ┌──────────────────────────────────┐
        │ dataset/district_dist...csv       │  ← State flood statistics
        │ (Total flood events by state)     │
        └──────────────┬───────────────────┘
               │
        ┌──────▼──────────────────────────┐
        │  claudeproject/train_model.py    │  ← Training script
        │  (Merges all 3 datasets)         │
        └──────┬───────────────────────────┘
               │
               ├─→ Creates 13-feature training set
               │   (Rainfall, Drainage, Soil properties, Elevation, etc.)
               │
               ├─→ Trains RandomForest (200 estimators)
               │
               └─→ Trains LinearRegression
                   │
                   └─→ Saves Models:
                       ├── flood_severity_rf.pkl (5MB)
                       └── waterlogging_days_lr.pkl (1.2KB)
```

### **2️⃣ API REQUEST/RESPONSE FLOW**

```
FRONTEND (React) http://localhost:5173/
    │
    │  User enters Pincode: "500001"
    │
    └──→ POST http://localhost:5000/api/predictions/by-pincode
         │
         ├─→ BACKEND (Flask) app.py:5000
         │   │
         │   ├─→ routes/predictions.py
         │   │   │
         │   │   ├─→ Load: telangana_andhra_pincodes.csv
         │   │   │   Lookup: 500001 → Hyderabad, Telangana
         │   │   │
         │   │   ├─→ Load: master_dataset_with_labels.csv
         │   │   │   Find: All Hyderabad, Telangana rows
         │   │   │   Aggregate: Avg rainfall, drainage, elevation
         │   │   │
         │   │   ├─→ Load: soil_type_accurate.csv
         │   │   │   Find: Hyderabad's soil type
         │   │   │
         │   │   └─→ Call: ml_engine.predict()
         │   │       ├─→ Load trained models from models/ folder
         │   │       ├─→ Input: 13 features (rainfall, soil, elevation, etc.)
         │   │       ├─→ Predict: Risk Level, Risk Score, Waterlogging Days
         │   │       └─→ Return: Predictions with confidence scores
         │   │
         │   └─→ Build JSON Response:
         │       {
         │         "pincode": "500001",
         │         "district": "Hyderabad",
         │         "state": "Telangana",
         │         "annual_rainfall": 845.97,         ← From dataset
         │         "elevation": 536.0,                 ← From dataset
         │         "soil_type": "Medium Black",        ← From soil_type_accurate
         │         "drainage_quality": "Good",         ← Calculated from data
         │         "flood_risk_percent": 1,            ← From ML model
         │         "flood_severity": "Moderate",       ← From ML model
         │         "waterlogging_days": 0.0            ← From ML regression
         │       }
         │
         └──← Response sent back
             │
             └──→ FRONTEND receives JSON
                  │
                  └──→ React updates state
                       │
                       └──→ Components render with real data
                           ├── LocationProfileCard
                           │   ├── Annual Rainfall: 845.97 mm
                           │   ├── Elevation: 536.0 m
                           │   ├── Soil Type: Medium Black
                           │   └── Drainage: Good
                           │
                           ├── FloodRiskGauge (shows 1% risk)
                           ├── WaterloggingCard (shows 0 days)
                           └── Other analysis panels
```

---

## 📊 Dataset Connections Summary

| Dataset | Location | Purpose | Records | Key Columns |
|---------|----------|---------|---------|-------------|
| **Pincode Mapping** | `dataset/telangana_andhra_pincodes.csv` | Map user pincode → district/state | 16,936 | pincode, district, state |
| **Training Data** | `dataset/master_dataset_with_labels.csv` | ML training & aggregation | 550 | Rainfall, Drainage, Elevation, etc. |
| **Soil Accuracy** | `dataset/soil_type_accurate.csv` | Detailed soil properties | 57 districts | Soil_Type, Clay%, pH, Permeability |
| **Flood Stats** | `dataset/district_distribution_statewise_cleaned.csv` | State-level statistics | 38 states | State, Total (flood events) |
| **ML Features** | `megadataset/master_dataset_model_ready.csv` | Pre-engineered features | 550 | 77 columns (for model training) |

---

## 🎯 How Everything Connects

```
User Interface (React)
        ↓
Frontend Components (UserDashboard.jsx, LocationProfileCard.jsx)
        ↓
HTTP Request to Flask API (POST /api/predictions/by-pincode)
        ↓
Backend Routes (routes/predictions.py)
        ↓
Dataset Loading & Merging:
    ├─ Load telangana_andhra_pincodes.csv → Validate pincode
    ├─ Load master_dataset_with_labels.csv → Get district data
    ├─ Load soil_type_accurate.csv → Get soil properties
    └─ Load district_distribution_statewise_cleaned.csv → Get state stats
        ↓
Feature Aggregation:
    ├─ Calculate avg rainfall (mm)
    ├─ Calculate avg elevation (m)
    ├─ Extract soil type
    └─ Calculate drainage quality
        ↓
ML Prediction Engine (utils/ml_engine.py)
        ├─ Load trained models from models/ folder
        ├─ Create 13-feature vector
        ├─ Run RandomForest classifier → Risk level
        └─ Run LinearRegression → Waterlogging days
        ↓
JSON Response with all predictions & data
        ↓
Frontend receives & displays results
```

---

## 🚀 Where to Find Key Features

| Feature | File | Port |
|---------|------|------|
| **Backend API** | `claudeproject/app.py` | 5000 |
| **Frontend UI** | `Flood new/index.html` | 5173 |
| **Prediction Logic** | `claudeproject/routes/predictions.py` | - |
| **ML Models** | `claudeproject/models/` | - |
| **Model Training** | `claudeproject/train_model.py` | - |
| **User Dashboard** | `Flood new/UserDashboard.jsx` | 5173 |
| **Location Card** | `Flood new/LocationProfileCard.jsx` | 5173 |

---

## 💾 Configuration File

**Location:** `claudeproject/config.py`

Defines all dataset paths:
```python
PINCODES_CSV = 'dataset/telangana_andhra_pincodes.csv'
LABELED_DATASET_CSV = 'dataset/master_dataset_with_labels.csv'
SOIL_ACCURATE_CSV = 'dataset/soil_type_accurate.csv'
DISTRICT_DIST_CSV = 'dataset/district_distribution_statewise_cleaned.csv'
MEGADATASET_CSV = 'megadataset/master_dataset_model_ready.csv'
```

These paths are used by both the prediction engine and the training script.

---

## 🔄 Current Running Services

| Service | Command | URL | Status |
|---------|---------|-----|--------|
| Backend Flask API | `python app.py` | http://localhost:5000 | ✅ Running |
| Frontend React Dev | `npm run dev` | http://localhost:5173 | ✅ Running |
| Database | SQLite (if used) | - | ✅ Optional |

---

## Summary

**BACKEND:** `claudeproject/` folder
- Flask server combining data from multiple CSV files
- ML models making predictions
- APIs returning rainfall, elevation, soil type, and flood risk

**DATASETS:** `dataset/` folder
- Pincode mapping (16K pincodes)
- Training data (550 records)
- Soil properties (57 district combinations)
- Flood statistics (38 states)

**FRONTEND:** `Flood new/` folder
- React app displaying predictions
- Shows all data from backend APIs
- User-friendly dashboard with maps and analytics

**CONNECTION:** User → Frontend → Backend APIs → Dataset Loading → ML Models → Response back to Frontend
