import pandas as pd
import json
import glob

print("=" * 100)
print("ENCODED + NORMALIZED DATA OUTPUT COMPARISON")
print("=" * 100)

# Example 1: Telangana Pincodes
print("\n\n1. TELANGANA & ANDHRA PINCODES")
print("-" * 100)

print("\n📋 ORIGINAL DATA:")
orig_pin = pd.read_csv('flood_project/dataset/telangana_andhra_pincodes.csv')
print(f"Shape: {orig_pin.shape}")
print("\nFirst 3 rows:")
print(orig_pin.iloc[:3, :8].to_string())

print("\n\n📋 ENCODED DATA (*_encoded.csv):")
enc_pin = pd.read_csv('flood_project/dataset/telangana_andhra_pincodes_encoded.csv')
print(f"Shape: {enc_pin.shape}")
print("\nFirst 3 rows (same 8 columns):")
print(enc_pin.iloc[:3, :8].to_string())

print("\n\n📋 NORMALIZED DATA (*_normalized.csv):")
norm_pin = pd.read_csv('flood_project/dataset/telangana_andhra_pincodes_normalized.csv')
print(f"Shape: {norm_pin.shape}")
print("\nFirst 3 rows (same 8 columns - numeric only normalized):")
print(norm_pin.iloc[:3, :8].to_string())

print("\n\n📋 ENCODED + NORMALIZED DATA (*_normalized_encoded.csv):")
enc_norm_pin = pd.read_csv('flood_project/dataset/telangana_andhra_pincodes_normalized_encoded.csv')
print(f"Shape: {enc_norm_pin.shape}")
print("\nFirst 3 rows (all text encoded + numeric normalized to 0-1):")
print(enc_norm_pin.iloc[:3, :8].to_string())

# Load encoding mappings
with open('flood_project/dataset/_encoding_mappings.json', 'r') as f:
    enc_map = json.load(f)

with open('flood_project/dataset/_encoding_mappings_normalized.json', 'r') as f:
    enc_norm_map = json.load(f)

with open('flood_project/dataset/_normalization_params.json', 'r') as f:
    norm_params = json.load(f)

print("\n\n🔄 TRANSFORMATION MAPPING FOR 'circlename':")
print("-" * 100)
if 'telangana_andhra_pincodes.csv' in enc_map:
    mapping = enc_map['telangana_andhra_pincodes.csv']['circlename']
    print("\nOriginal values → Encoded values:")
    for orig, enc in zip(mapping['original_values'], mapping['encoded_values']):
        print(f"  '{orig}' → {enc}")

print("\n\n" + "=" * 100)
print("2. RAINFALL DATA (daily_rainfall_2020_2024)")
print("-" * 100)

print("\n📋 ORIGINAL DATA:")
orig_rain = pd.read_csv('flood_project/dataset/daily_rainfall_2020_2024.csv')
print(f"Shape: {orig_rain.shape}")
print("\nFirst 3 rows:")
print(orig_rain.iloc[:3, :5].to_string())

print("\n\n📋 NORMALIZED DATA (*_normalized.csv):")
norm_rain = pd.read_csv('flood_project/dataset/daily_rainfall_2020_2024_normalized.csv')
print(f"Shape: {norm_rain.shape}")
print("\nFirst 3 rows:")
print(norm_rain.iloc[:3, :5].to_string())

print("\n\n📋 ENCODED + NORMALIZED DATA (*_normalized_encoded.csv):")
enc_norm_rain = pd.read_csv('flood_project/dataset/daily_rainfall_2020_2024_normalized_encoded.csv')
print(f"Shape: {enc_norm_rain.shape}")
print("\nFirst 3 rows:")
print(enc_norm_rain.iloc[:3, :5].to_string())

# Show normalization example
if 'daily_rainfall_2020_2024.csv' in norm_params:
    print("\n\n📊 NORMALIZATION TRANSFORMATION:")
    rainfall_col = 'Daily_Rainfall_mm'
    if rainfall_col in norm_params['daily_rainfall_2020_2024.csv']:
        params = norm_params['daily_rainfall_2020_2024.csv'][rainfall_col]
        orig_val = orig_rain[rainfall_col].iloc[0]
        norm_val = norm_rain[rainfall_col].iloc[0]
        print(f"\n  Column: {rainfall_col}")
        print(f"  Original Range: [{params['original_min']:.2f}, {params['original_max']:.2f}]")
        print(f"  Normalized Range: [{params['normalized_min']:.2f}, {params['normalized_max']:.2f}]")
        print(f"\n  Example Conversion:")
        print(f"    Original value: {orig_val:.2f}")
        print(f"    Normalized value: {norm_val:.4f}")
        print(f"    Formula: ({orig_val:.2f} - {params['original_min']:.2f}) / ({params['original_max']:.2f} - {params['original_min']:.2f}) = {norm_val:.4f}")

print("\n\n" + "=" * 100)
print("3. MASTER DATASET WITH LABELS")
print("-" * 100)

print("\n📋 ORIGINAL DATA (numeric columns only):")
orig_master = pd.read_csv('flood_project/dataset/master_dataset_with_labels.csv')
print(f"Shape: {orig_master.shape}")
numeric_cols = orig_master.select_dtypes(include=['int64', 'float64']).columns[:4]
print(f"\nFirst 2 rows of numeric columns {list(numeric_cols)}:")
print(orig_master[numeric_cols].iloc[:2].to_string())

print("\n\n📋 NORMALIZED DATA (*_normalized.csv):")
norm_master = pd.read_csv('flood_project/dataset/master_dataset_with_labels_normalized.csv')
print(f"Shape: {norm_master.shape}")
print(f"\nFirst 2 rows (same columns, all scaled to 0-1):")
print(norm_master[numeric_cols].iloc[:2].to_string())

print("\n\n📋 ENCODED + NORMALIZED DATA (*_normalized_encoded.csv):")
enc_norm_master = pd.read_csv('flood_project/dataset/master_dataset_with_labels_normalized_encoded.csv')
print(f"Shape: {enc_norm_master.shape}")
print(f"\nFirst 2 rows (text encoded + numbers normalized):")
print(enc_norm_master[numeric_cols].iloc[:2].to_string())

print("\n\n" + "=" * 100)
print("FILE SUMMARY")
print("=" * 100)

import glob
orig_count = len(glob.glob('flood_project/dataset/*.csv')) - 1  # Exclude total count
enc_count = len(glob.glob('flood_project/dataset/*_encoded.csv'))
norm_count = len(glob.glob('flood_project/dataset/*_normalized.csv'))
enc_norm_count = len(glob.glob('flood_project/dataset/*_normalized_encoded.csv'))

print(f"\n✓ Original CSV files:                {orig_count}")
print(f"✓ Encoded CSV files (*_encoded):    {enc_count}")
print(f"✓ Normalized CSV files (*_normalized): {norm_count}")
print(f"✓ Encoded+Normalized CSV files (*_normalized_encoded): {enc_norm_count}")

print(f"\n\n✓ Reference Files Created:")
print(f"  • _encoding_mappings.json")
print(f"  • _normalization_params.json")
print(f"  • _encoding_mappings_normalized.json")

print("\n\n" + "=" * 100)
print("DATA TRANSFORMATION SUMMARY")
print("=" * 100)

print("""
ORIGINAL DATA:
  • Text columns: As-is (e.g., "Telangana Circle", "Hyderabad")
  • Numeric columns: Original ranges (e.g., 0-332 for rainfall, 5-658 for elevation)

ENCODED DATA (*_encoded.csv):
  • Text columns: Converted to 0, 1, 2, ... (e.g., "Telangana Circle" → 4)
  • Numeric columns: Unchanged (original ranges)
  • Mapping stored in: _encoding_mappings.json

NORMALIZED DATA (*_normalized.csv):
  • Text columns: Unchanged (e.g., "Telangana Circle")
  • Numeric columns: Scaled to 0-1 range using Min-Max scaler
  • Parameters stored in: _normalization_params.json

ENCODED + NORMALIZED DATA (*_normalized_encoded.csv):
  • Text columns: Converted to 0, 1, 2, ...
  • Numeric columns: Scaled to 0-1 range
  • Both mappings stored in: _encoding_mappings_normalized.json
  • All values are now numeric 0-1 (READY FOR ML MODELS)
""")
