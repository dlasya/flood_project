import os
import pandas as pd
from sklearn.preprocessing import LabelEncoder
import json
import glob

# Directory containing CSV files
dataset_dir = "flood_project/dataset"

# Get all normalized CSV files
normalized_files = glob.glob(os.path.join(dataset_dir, "*_normalized.csv"))

print(f"Found {len(normalized_files)} normalized CSV files to encode")
print("\n" + "="*80)

encoding_mappings_normalized = {}

for csv_file in sorted(normalized_files):
    filename = os.path.basename(csv_file)
    print(f"\nProcessing: {filename}")
    
    try:
        # Read the normalized CSV file
        df = pd.read_csv(csv_file)
        print(f"  Shape: {df.shape}")
        
        # Create a copy for encoding
        df_encoded_normalized = df.copy()
        file_encoding_map = {}
        
        # Find categorical columns (object type)
        categorical_cols = df_encoded_normalized.select_dtypes(include=['object']).columns.tolist()
        
        if categorical_cols:
            print(f"  Categorical columns found: {categorical_cols}")
            
            # Encode each categorical column
            for col in categorical_cols:
                le = LabelEncoder()
                try:
                    # Fit and transform
                    df_encoded_normalized[col] = le.fit_transform(df[col].astype(str))
                    
                    # Store the mapping for this column
                    file_encoding_map[col] = {
                        "original_values": le.classes_.tolist(),
                        "encoded_values": list(range(len(le.classes_)))
                    }
                    print(f"    ✓ Encoded '{col}': {len(le.classes_)} unique values → numeric")
                except Exception as e:
                    print(f"    ✗ Failed to encode '{col}': {e}")
        else:
            print(f"  No categorical columns found (all numeric or empty)")
        
        # Save encoded+normalized CSV
        output_filename = csv_file.replace("_normalized.csv", "_normalized_encoded.csv")
        df_encoded_normalized.to_csv(output_filename, index=False)
        print(f"  ✓ Saved: {os.path.basename(output_filename)}")
        
        # Store encoding map for this file
        if file_encoding_map:
            encoding_mappings_normalized[filename] = file_encoding_map

    except Exception as e:
        print(f"  ✗ Error processing {filename}: {e}")

# Save encoding mappings to JSON for reference
mapping_output = os.path.join(dataset_dir, "_encoding_mappings_normalized.json")
with open(mapping_output, 'w') as f:
    json.dump(encoding_mappings_normalized, f, indent=2)

print("\n" + "="*80)
print(f"\n✅ ENCODING OF NORMALIZED DATA COMPLETE!")
print(f"   Encoding mappings saved to: {mapping_output}")
print(f"\nEncoded+Normalized files created with '_normalized_encoded.csv' suffix")
print(f"Original normalized files remain unchanged")
print(f"\nDataset Versions Available:")
print(f"  1. Original: *.csv (text + numeric as-is)")
print(f"  2. Normalized: *_normalized.csv (all numeric 0-1 range, text unchanged)")
print(f"  3. Encoded: *_encoded.csv (numeric as-is, text to numbers)")
print(f"  4. Encoded+Normalized: *_normalized_encoded.csv (all numeric 0-1 range, text to numbers)")
