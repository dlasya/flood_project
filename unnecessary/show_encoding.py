import pandas as pd
import json

# Show original data
print("=" * 80)
print("ORIGINAL DATA (telangana_andhra_pincodes.csv)")
print("=" * 80)
orig = pd.read_csv('flood_project/dataset/telangana_andhra_pincodes.csv')
print(f"Shape: {orig.shape}")
print(f"Columns: {orig.columns.tolist()}")
print("\nFirst 3 rows:")
print(orig.iloc[:3, :6].to_string())

print("\n" + "=" * 80)
print("ENCODED DATA (telangana_andhra_pincodes_encoded.csv)")
print("=" * 80)
encoded = pd.read_csv('flood_project/dataset/telangana_andhra_pincodes_encoded.csv')
print(f"Shape: {encoded.shape}")
print(f"Columns: {encoded.columns.tolist()}")
print("\nFirst 3 rows:")
print(encoded.iloc[:3, :6].to_string())

print("\n" + "=" * 80)
print("SAMPLE ENCODING MAPPINGS")
print("=" * 80)
with open('flood_project/dataset/_encoding_mappings.json', 'r') as f:
    mappings = json.load(f)

if 'telangana_andhra_pincodes.csv' in mappings:
    content = mappings['telangana_andhra_pincodes.csv']
    first_col = list(content.keys())[0]
    print(f"\nColumn: {first_col}")
    mapping = content[first_col]
    print(f"Mapping (showing first 5):")
    for orig_val, enc_val in list(zip(mapping['original_values'], mapping['encoded_values']))[:5]:
        print(f"  '{orig_val}' → {enc_val}")
    print(f"  ... and {len(mapping['original_values']) - 5} more")

print("\n" + "=" * 80)
print("KEY POINTS")
print("=" * 80)
print("✓ Original files: UNCHANGED (still available)")
print("✓ Encoded files: Created with '_encoded.csv' suffix")
print("✓ Numeric columns: UNCHANGED in encoded files")
print("✓ Text columns: ENCODED to numeric values (0, 1, 2, ...)")
print("✓ Mapping reference: _encoding_mappings.json")
