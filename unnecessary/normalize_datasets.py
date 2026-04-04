import os
import pandas as pd
import json
import glob
from sklearn.preprocessing import MinMaxScaler

# Directory containing CSV files
dataset_dir = "flood_project/dataset"

# Get all CSV files (exclude already encoded files)
csv_files = [f for f in glob.glob(os.path.join(dataset_dir, "*.csv")) 
             if not f.endswith("_encoded.csv")]

print(f"Found {len(csv_files)} CSV files to normalize")
print("\n" + "="*80)

normalization_params = {}

for csv_file in sorted(csv_files):
    filename = os.path.basename(csv_file)
    print(f"\nProcessing: {filename}")
    
    try:
        # Read the CSV file
        df = pd.read_csv(csv_file)
        print(f"  Shape: {df.shape}")
        
        # Create a copy for normalization
        df_normalized = df.copy()
        file_norm_params = {}
        
        # Find numeric columns
        numeric_cols = df_normalized.select_dtypes(include=['int64', 'int32', 'float64', 'float32']).columns.tolist()
        
        if numeric_cols:
            print(f"  Numeric columns found: {len(numeric_cols)}")
            
            # Normalize each numeric column
            scaler = MinMaxScaler(feature_range=(0, 1))
            
            for col in numeric_cols:
                # Get min and max values before normalization
                original_min = float(df[col].min())
                original_max = float(df[col].max())
                
                # Skip if min == max (constant column)
                if original_min == original_max:
                    print(f"    ⚠ Skipped '{col}' (constant value: {original_min})")
                    file_norm_params[col] = {
                        "original_min": original_min,
                        "original_max": original_max,
                        "normalized_min": 0,
                        "normalized_max": 1,
                        "status": "constant_column"
                    }
                    continue
                
                # Normalize the column
                try:
                    df_normalized[col] = MinMaxScaler(feature_range=(0, 1)).fit_transform(df[[col]])
                    
                    # Store normalization parameters
                    file_norm_params[col] = {
                        "original_min": original_min,
                        "original_max": original_max,
                        "normalized_min": 0.0,
                        "normalized_max": 1.0,
                        "status": "normalized"
                    }
                    print(f"    ✓ Normalized '{col}': [{original_min:.2f}, {original_max:.2f}] → [0.0, 1.0]")
                except Exception as e:
                    print(f"    ✗ Failed to normalize '{col}': {e}")
        else:
            print(f"  No numeric columns found (all categorical or empty)")
        
        # Save normalized CSV
        output_filename = csv_file.replace(".csv", "_normalized.csv")
        df_normalized.to_csv(output_filename, index=False)
        print(f"  ✓ Saved: {os.path.basename(output_filename)}")
        
        # Store normalization params for this file
        if file_norm_params:
            normalization_params[filename] = file_norm_params

    except Exception as e:
        print(f"  ✗ Error processing {filename}: {e}")

# Save normalization parameters to JSON for reference
params_output = os.path.join(dataset_dir, "_normalization_params.json")
with open(params_output, 'w') as f:
    json.dump(normalization_params, f, indent=2)

print("\n" + "="*80)
print(f"\n✅ NORMALIZATION COMPLETE!")
print(f"   Normalization parameters saved to: {params_output}")
print(f"\nNormalized files created with '_normalized.csv' suffix")
print(f"Original files remain unchanged")
print(f"\nNormalization Method: Min-Max Scaling (0 to 1 range)")
print(f"Formula: X_normalized = (X - X_min) / (X_max - X_min)")
print(f"\nTo use normalized data:")
print(f"  1. Use the '_normalized.csv' files for ML models")
print(f"  2. Reference '_normalization_params.json' to denormalize values")
print(f"  3. Categorical columns remain unchanged")
