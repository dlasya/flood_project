import os
import pandas as pd
from sklearn.preprocessing import LabelEncoder
import json
import glob

# Directory containing CSV files
dataset_dir = "flood_project/dataset"

# Get all CSV files
csv_files = glob.glob(os.path.join(dataset_dir, "*.csv"))

print(f"Found {len(csv_files)} CSV files to encode")
print("\n" + "="*80)

encoding_mappings = {}

for csv_file in sorted(csv_files):
    filename = os.path.basename(csv_file)
    print(f"\nProcessing: {filename}")
    
    try:
        # Read the CSV file
        df = pd.read_csv(csv_file)
        print(f"  Shape: {df.shape}")
        
        # Create a copy for encoding
        df_encoded = df.copy()
        file_encoding_map = {}
        
        # Find categorical columns (object type)
        categorical_cols = df_encoded.select_dtypes(include=['object']).columns.tolist()
        
        if categorical_cols:
            print(f"  Categorical columns found: {categorical_cols}")
            
            # Encode each categorical column
            for col in categorical_cols:
                le = LabelEncoder()
                try:
                    # Fit and transform
                    df_encoded[col] = le.fit_transform(df[col].astype(str))
                    
                    # Store the mapping for this column
                    file_encoding_map[col] = {
                        "original_values": le.classes_.tolist(),
                        "encoded_values": list(range(len(le.classes_)))
                    }
                    print(f"    ✓ Encoded '{col}': {len(le.classes_)} unique values → numeric")
                except Exception as e:
                    print(f"    ✗ Failed to encode '{col}': {e}")
        else:
            print(f"  No categorical columns found (all numeric)")
        
        # Save encoded CSV
        output_filename = csv_file.replace(".csv", "_encoded.csv")
        df_encoded.to_csv(output_filename, index=False)
        print(f"  ✓ Saved: {os.path.basename(output_filename)}")
        
        # Store encoding map for this file
        if file_encoding_map:
            encoding_mappings[filename] = file_encoding_map

    except Exception as e:
        print(f"  ✗ Error processing {filename}: {e}")

# Save encoding mappings to JSON for reference
mapping_output = os.path.join(dataset_dir, "_encoding_mappings.json")
with open(mapping_output, 'w') as f:
    json.dump(encoding_mappings, f, indent=2)

print("\n" + "="*80)
print(f"\n✅ ENCODING COMPLETE!")
print(f"   Encoding mappings saved to: {mapping_output}")
print(f"\nEncoded files created with '_encoded.csv' suffix")
print(f"Original files remain unchanged")
print(f"\nTo use encoded data:")
print(f"  1. Use the '_encoded.csv' files for ML models")
print(f"  2. Reference '_encoding_mappings.json' to decode categorical values")
print(f"  3. All numeric columns remain unchanged")
