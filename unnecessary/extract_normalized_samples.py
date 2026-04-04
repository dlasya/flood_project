import pandas as pd
import os

# Ensure we're working with absolute paths
base_path = 'flood_project/dataset'

output = []

# 1. Pincodes
pincodes = pd.read_csv(os.path.join(base_path, 'telangana_andhra_pincodes_normalized_encoded.csv'))
output.append("DATASET: Telangana & Andhra Pincodes (normalized + encoded)")
output.append(f"Total Records: {len(pincodes)}, Columns: {len(pincodes.columns)}")
output.append("First 5 rows with ALL numeric values (after encoding text + normalizing numbers):")
output.append(pincodes.head(5).to_csv())

# 2. Rainfall
rainfall = pd.read_csv(os.path.join(base_path, 'daily_rainfall_2020_2024_normalized_encoded.csv'))
output.append("\n" + "="*100)
output.append("\nDATASET: Daily Rainfall 2020-2024 (normalized + encoded)")
output.append(f"Total Records: {len(rainfall)}, Columns: {len(rainfall.columns)}")
output.append("Sample rows showing normalized 0-1 values:")
output.append(rainfall.iloc[[0, 100, 500, 1000, 5000]].to_csv())

# 3. Master Dataset
master = pd.read_csv(os.path.join(base_path, 'master_dataset_with_labels_normalized_encoded.csv'))
cols = list(master.columns)[:10] + ['Flood_Occurred', 'Waterlogging_Occurred', 'Waterlogging_Days']
output.append("\n" + "="*100)
output.append("\nDATASET: Master Dataset with Labels (normalized + encoded)")
output.append(f"Total Records: {len(master)}, Total Columns: {len(master.columns)}")
output.append(f"Showing first 10 columns + target columns:")
output.append(master[cols].head(5).to_csv())

# 4. Soil Type
soil = pd.read_csv(os.path.join(base_path, 'soil_type_accurate_normalized_encoded.csv'))
output.append("\n" + "="*100)
output.append("\nDATASET: Soil Type Accurate (normalized + encoded)")
output.append(f"Total Records: {len(soil)}, Columns: {len(soil.columns)}")
output.append("All rows (all numeric after encoding text):")
output.append(soil.to_csv())

# 5. District Distribution
dist = pd.read_csv(os.path.join(base_path, 'district_distribution_statewise_normalized_encoded.csv'))
output.append("\n" + "="*100)
output.append("\nDATASET: District Distribution Statewise (normalized + encoded)")
output.append(f"Total Records: {len(dist)}, Columns: {len(dist.columns)}")
output.append("All rows (numeric encoded):")
output.append(dist.to_csv())

# Write to CSV file
output_path = 'normalized_dataset_samples.csv'
with open(output_path, 'w') as f:
    f.write('\n'.join(output))

print(f"✅ Normalized data samples saved to: {os.path.abspath(output_path)}")
print("\n" + "="*100)
print("\nDATA PREVIEW:")
print("="*100)
for line in output[:30]:
    print(line)
print("\n... (see normalized_dataset_samples.csv for complete output)")
