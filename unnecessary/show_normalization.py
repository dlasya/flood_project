import pandas as pd
import json

print("=" * 80)
print("NORMALIZATION COMPARISON")
print("=" * 80)

# Example 1: Rainfall data
print("\n1. RAINFALL DATA (daily_rainfall_2020_2024.csv)")
print("-" * 80)

orig_rainfall = pd.read_csv('flood_project/dataset/daily_rainfall_2020_2024.csv')
norm_rainfall = pd.read_csv('flood_project/dataset/daily_rainfall_2020_2024_normalized.csv')

print(f"\nOriginal Data (first 3 rows):")
print(orig_rainfall.iloc[:3, :5].to_string())

print(f"\n\nNormalized Data (first 3 rows):")
print(norm_rainfall.iloc[:3, :5].to_string())

# Load normalization parameters
with open('flood_project/dataset/_normalization_params.json', 'r') as f:
    params = json.load(f)

if 'daily_rainfall_2020_2024.csv' in params:
    print(f"\n\nNormalization Parameters:")
    for col, details in list(params['daily_rainfall_2020_2024.csv'].items())[:3]:
        if details.get('status') == 'normalized':
            print(f"\n  Column: {col}")
            print(f"    Original Range: [{details['original_min']:.2f}, {details['original_max']:.2f}]")
            print(f"    Normalized To: [{details['normalized_min']:.2f}, {details['normalized_max']:.2f}]")

# Example 2: Master dataset
print("\n\n" + "=" * 80)
print("2. MASTER DATASET WITH LABELS (master_dataset_with_labels.csv)")
print("-" * 80)

orig_master = pd.read_csv('flood_project/dataset/master_dataset_with_labels.csv')
norm_master = pd.read_csv('flood_project/dataset/master_dataset_with_labels_normalized.csv')

print(f"\nOriginal Data (first 2 rows, numeric columns only):")
numeric_cols = orig_master.select_dtypes(include=['int64', 'float64']).columns[:5]
print(orig_master[numeric_cols].iloc[:2].to_string())

print(f"\n\nNormalized Data (first 2 rows, same columns):")
print(norm_master[numeric_cols].iloc[:2].to_string())

# Example 3: Elevation
print("\n\n" + "=" * 80)
print("3. ELEVATION DATA (elevation_dem.csv)")
print("-" * 80)

orig_elev = pd.read_csv('flood_project/dataset/elevation_dem.csv')
norm_elev = pd.read_csv('flood_project/dataset/elevation_dem_normalized.csv')

numeric_cols_elev = orig_elev.select_dtypes(include=['int64', 'float64']).columns.tolist()
if numeric_cols_elev:
    col = numeric_cols_elev[0]
    print(f"\nColumn: {col}")
    print(f"Original values: {orig_elev[col].iloc[:5].tolist()}")
    print(f"Normalized values: {norm_elev[col].iloc[:5].tolist()}")
    
    if 'elevation_dem.csv' in params and col in params['elevation_dem.csv']:
        details = params['elevation_dem.csv'][col]
        print(f"\nNormalization Formula:")
        print(f"  normalized_value = (original_value - {details['original_min']:.2f}) / ({details['original_max']:.2f} - {details['original_min']:.2f})")
        print(f"\n  Example:")
        print(f"  normalized({orig_elev[col].iloc[0]:.2f}) = ({orig_elev[col].iloc[0]:.2f} - {details['original_min']:.2f}) / {details['original_max'] - details['original_min']:.2f}")
        print(f"             = {norm_elev[col].iloc[0]:.4f}")

print("\n" + "=" * 80)
print("KEY INFORMATION")
print("=" * 80)
print(f"\n✓ Normalization Method: Min-Max Scaling (0 to 1)")
print(f"✓ Numeric Columns: Scaled to [0, 1] range")
print(f"✓ Categorical Columns: Unchanged")
print(f"✓ Original Files: NOT modified")
print(f"✓ New Files: Created with '_normalized.csv' suffix")
print(f"✓ Parameters: Saved in '_normalization_params.json'")

print("\n" + "=" * 80)
print("FILE COUNTS")
print("=" * 80)
import glob
original_files = len(glob.glob('flood_project/dataset/*.csv'))
normalized_files = len(glob.glob('flood_project/dataset/*_normalized.csv'))
print(f"\nOriginal CSV files: {original_files - 1}  (excluding .json)")
print(f"Normalized CSV files: {normalized_files}")
