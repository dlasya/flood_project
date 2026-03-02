import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import joblib
import os

# 1. Create the 'models' directory if it doesn't exist
if not os.path.exists('models'):
    os.makedirs('models')

# 2. Setup training data based on your Abstract parameters
# Features: [Rainfall, Drainage, Soil, LandUse, History, Elevation]
data = {
    'rainfall': [10, 50, 100, 200, 300, 20, 80, 150, 5, 400],
    'drainage': [1,  2,  3,   5,   5,   1,  3,  4,   1,  5],   # 1=Good, 5=Poor
    'soil':     [.8, .6, .4,  .1,  .05, .9, .5, .2,  .9, .01], # Permeability
    'land_use': [1,  1,  2,   3,   3,   1,  2,  3,   1,  3],   # 1=Rural, 3=Urban
    'history':  [0,  0,  0,   1,   1,   0,  0,  1,   0,  1],   # 0=No, 1=Yes
    'elevation':[50, 30, 15,  5,   2,   60, 20, 10,  70, 1],   # Meters
    'label':    [0,  0,  1,   2,   2,   0,  1,  2,   0,  2]    # 0=Low, 1=Med, 2=High
}

df = pd.DataFrame(data)

# 3. Train the Random Forest Model
X = df.drop('label', axis=1)
y = df['label']

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# 4. Save the model to the path your backend expects
model_filename = 'models/flood_model.pkl'
joblib.dump(model, model_filename)

print(f"✅ Success! Objective 1 Complete.")
print(f"Model saved at: {model_filename}")
