import pandas as pd
import numpy as np
import requests
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LinearRegression

print("=" * 80)
print("VERIFYING PINCODE/DISTRICT/RAINFALL CORRELATION & ML ANALYSIS")
print("=" * 80)

API_BASE = 'http://localhost:5001'

# 1. VERIFY PINCODE TO RAINFALL CORRELATION LOGIC
print("\n1. PINCODE TO RAINFALL CORRELATION LOGIC")
print("-" * 50)

# Load datasets
zipcodes_df = pd.read_csv('zipcodes.csv')
labeled_df = pd.read_csv('dataset/master_dataset_with_labels.csv')

# Test specific pincodes and their rainfall correlation
test_cases = [
    500018,  # Hyderabad area
    500001,  # Hyderabad city
    530001,  # Visakhapatnam
    520001,  # Vijayawada/Krishna
    506001,  # Warangal
]

for pincode in test_cases:
    print(f"\nPincode {pincode}:")
    
    # Get pincode info
    pincode_match = zipcodes_df[zipcodes_df['pincode'] == pincode]
    if not pincode_match.empty:
        district = pincode_match.iloc[0]['Districtname']
        state = pincode_match.iloc[0]['statename']
        print(f"  Location: {district}, {state}")
        
        # Get rainfall data for this district
        district_data = labeled_df[
            (labeled_df['District'].str.strip().str.upper() == district.upper()) &
            (labeled_df['State'].str.strip().str.upper() == state.upper())
        ]
        
        if not district_data.empty:
            rainfall_stats = {
                'min': district_data['Monsoon_Rainfall_mm'].min(),
                'max': district_data['Monsoon_Rainfall_mm'].max(),
                'mean': district_data['Monsoon_Rainfall_mm'].mean(),
                'std': district_data['Monsoon_Rainfall_mm'].std(),
                'records': len(district_data)
            }
            print(f"  Rainfall Data: {rainfall_stats}")
        else:
            print(f"  ERROR: No rainfall data found for {district}")
    else:
        print(f"  ERROR: Pincode {pincode} not found")

# 2. CHECK DRAINAGE AND OTHER DATASET INTEGRATION
print("\n\n2. DRAINAGE AND OTHER DATASET INTEGRATION")
print("-" * 50)

# Check what features are available in the dataset
master_df = pd.read_csv('megadataset/master_dataset_model_ready.csv')
available_features = master_df.columns.tolist()

print(f"Total features in master dataset: {len(available_features)}")

# Key features for flood analysis
key_features = [
    'Monsoon_Rainfall_mm',
    'Drainage_Quality_Enc', 
    'Permeability_mm_per_hr',
    'Urban_Percent',
    'Breach_History_Enc',
    'Mean_Elevation_m',
    'Flood_Severity_Enc',
    'Waterlogging_Days'
]

print("\nKey features availability:")
for feature in key_features:
    if feature in available_features:
        stats = master_df[feature].describe()
        print(f"  {feature}: AVAILABLE (min={stats['min']:.2f}, max={stats['max']:.2f}, mean={stats['mean']:.2f})")
    else:
        print(f"  {feature}: MISSING")

# 3. VALIDATE RANDOM FOREST MODEL FOR FLOOD ANALYSIS
print("\n\n3. RANDOM FOREST MODEL VALIDATION")
print("-" * 50)

try:
    # Load the trained Random Forest model
    rf_model = joblib.load('models/rf_severity_6feat.pkl')
    
    print(f"Random Forest Model loaded successfully")
    print(f"Model type: {type(rf_model)}")
    print(f"Features expected: {rf_model.n_features_in_}")
    print(f"Feature names: {list(rf_model.feature_names_in_)}")
    
    # Test with known data points
    test_data = pd.DataFrame([
        # Low risk scenario
        [200.0, 3.0, 15.0, 30.0, 0.0, 200.0],
        # Moderate risk scenario  
        [600.0, 2.0, 25.0, 50.0, 1.0, 300.0],
        # High risk scenario
        [1200.0, 1.0, 35.0, 70.0, 2.0, 150.0]
    ], columns=rf_model.feature_names_in_)
    
    predictions = rf_model.predict(test_data)
    probabilities = rf_model.predict_proba(test_data)
    
    risk_levels = {1: "Low", 2: "Moderate", 3: "High"}
    
    print("\nRandom Forest Predictions:")
    for i, (pred, probs) in enumerate(zip(predictions, probabilities)):
        risk_level = risk_levels.get(int(pred), "Unknown")
        confidence = np.max(probs)
        print(f"  Test {i+1}: {risk_level} (confidence: {confidence:.3f})")
        print(f"    Probabilities: Low={probs[0]:.3f}, Moderate={probs[1]:.3f}, High={probs[2]:.3f}")
    
except Exception as e:
    print(f"Error loading Random Forest model: {e}")

# 4. VALIDATE LINEAR REGRESSION MODEL FOR WATERLOGGING ANALYSIS
print("\n\n4. LINEAR REGRESSION MODEL VALIDATION")
print("-" * 50)

try:
    # Load the trained Linear Regression model
    lr_model = joblib.load('models/lr_waterlogging_6feat.pkl')
    
    print(f"Linear Regression Model loaded successfully")
    print(f"Model type: {type(lr_model)}")
    print(f"Features expected: {lr_model.n_features_in_}")
    print(f"Feature names: {list(lr_model.feature_names_in_)}")
    
    # Test with same data points
    water_predictions = lr_model.predict(test_data)
    
    print("\nLinear Regression Predictions:")
    for i, pred in enumerate(water_predictions):
        days = max(0, pred)  # Waterlogging days can't be negative
        severity = "Low" if days < 8 else "Moderate" if days < 15 else "Severe"
        print(f"  Test {i+1}: {days:.1f} days ({severity})")
    
    # Check model coefficients to understand feature importance
    coefficients = dict(zip(lr_model.feature_names_in_, lr_model.coef_))
    print("\nFeature Coefficients (Waterlogging):")
    for feature, coef in sorted(coefficients.items(), key=lambda x: abs(x[1]), reverse=True):
        print(f"  {feature}: {coef:.4f}")
    
except Exception as e:
    print(f"Error loading Linear Regression model: {e}")

# 5. TEST COMPLETE CORRELATION PIPELINE END-TO-END
print("\n\n5. END-TO-END CORRELATION PIPELINE TEST")
print("-" * 50)

for pincode in test_cases[:3]:  # Test first 3 pincodes
    print(f"\nTesting pincode {pincode}:")
    
    try:
        # Call API to get prediction
        response = requests.post(f"{API_BASE}/api/predictions/by-pincode", 
                               json={"pincode": pincode}, 
                               timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"  Location: {data['location']}")
            print(f"  Flood Risk: {data['risk_level']} (score: {data['risk_score']:.3f})")
            print(f"  Waterlogging: {data['waterlogging_days']:.1f} days")
            print(f"  Confidence: {data['confidence']:.3f}")
            
            # Verify the correlation makes sense
            pincode_match = zipcodes_df[zipcodes_df['pincode'] == pincode]
            if not pincode_match.empty:
                district = pincode_match.iloc[0]['Districtname']
                state = pincode_match.iloc[0]['statename']
                
                # Get actual rainfall data
                district_data = labeled_df[
                    (labeled_df['District'].str.strip().str.upper() == district.upper()) &
                    (labeled_df['State'].str.strip().str.upper() == state.upper())
                ]
                
                if not district_data.empty:
                    avg_rainfall = district_data['Monsoon_Rainfall_mm'].mean()
                    avg_drainage = district_data['Drainage_Quality_Enc'].mean()
                    
                    print(f"  Correlation Check:")
                    print(f"    District Rainfall: {avg_rainfall:.1f}mm")
                    print(f"    District Drainage: {avg_drainage:.1f}")
                    
                    # Check if prediction makes sense
                    if avg_rainfall > 800 and data['risk_level'] in ['Moderate', 'High']:
                        print(f"    Logic: High rainfall -> {data['risk_level']} risk (CORRECT)")
                    elif avg_rainfall < 500 and data['risk_level'] == 'Low':
                        print(f"    Logic: Low rainfall -> Low risk (CORRECT)")
                    else:
                        print(f"    Logic: Rainfall-risk correlation needs review")
                        
        else:
            print(f"  API Error: {response.status_code}")
            
    except Exception as e:
        print(f"  Test Error: {e}")

# 6. MODEL PERFORMANCE SUMMARY
print("\n\n6. MODEL PERFORMANCE SUMMARY")
print("-" * 50)

try:
    # Load model metadata
    metadata = joblib.load('models/metadata_6feat.pkl')
    
    print(f"Model Training Results:")
    print(f"  Random Forest Accuracy: {metadata['severity_accuracy']:.4f}")
    print(f"  Linear Regression R²: {metadata['waterlogging_r2']:.4f}")
    print(f"  Training Samples: {metadata['training_samples']}")
    print(f"  Features Used: {metadata['features']}")
    
    # Check if models are appropriate for the task
    rf_accuracy = metadata['severity_accuracy']
    lr_r2 = metadata['waterlogging_r2']
    
    print(f"\nModel Appropriateness:")
    if rf_accuracy > 0.7:
        print(f"  Random Forest: GOOD (accuracy > 70%)")
    else:
        print(f"  Random Forest: NEEDS IMPROVEMENT (accuracy < 70%)")
        
    if lr_r2 > 0.5:
        print(f"  Linear Regression: GOOD (R² > 0.5)")
    else:
        print(f"  Linear Regression: NEEDS IMPROVEMENT (R² < 0.5)")
        
except Exception as e:
    print(f"Error loading metadata: {e}")

print("\n" + "=" * 80)
print("CORRELATION PIPELINE VERIFICATION COMPLETE")
print("=" * 80)
