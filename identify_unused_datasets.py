import os
import pandas as pd
import re

print("IDENTIFYING UNUSED DATASETS")
print("=" * 50)

# 1. IDENTIFY ALL DATASET FILES
print("\n1. ALL DATASET FILES IN PROJECT")
print("-" * 40)

all_datasets = []
for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith(('.csv', '.pkl', '.json')) and 'node_modules' not in root and '.git' not in root:
            all_datasets.append(os.path.join(root, file))

print(f"Found {len(all_datasets)} dataset files:")
for dataset in sorted(all_datasets):
    size = os.path.getsize(dataset) / (1024*1024) if os.path.exists(dataset) else 0
    print(f"  {dataset:60} | {size:.1f}MB")

# 2. IDENTIFY USED DATASETS IN CODE
print(f"\n\n2. DATASETS REFERENCED IN CODE")
print("-" * 40)

# Find all Python and JSX files
code_files = []
for root, dirs, files in os.walk('.'):
    for file in files:
        if file.endswith(('.py', '.jsx', '.js')) and 'node_modules' not in root and '.git' not in root:
            code_files.append(os.path.join(root, file))

referenced_datasets = set()

for code_file in code_files:
    try:
        with open(code_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        # Look for dataset file references
        for dataset in all_datasets:
            dataset_name = os.path.basename(dataset)
            if dataset_name in content:
                referenced_datasets.add(dataset)
                
    except Exception as e:
        print(f"Error reading {code_file}: {e}")

print(f"Datasets referenced in code ({len(referenced_datasets)}):")
for dataset in sorted(referenced_datasets):
    print(f"  {dataset}")

# 3. CATEGORIZE DATASETS
print(f"\n\n3. DATASET CATEGORIZATION")
print("-" * 40)

# Essential datasets (core functionality)
essential_datasets = {
    'dataset/master_dataset_with_labels.csv': 'Core ML data with district labels',
    'megadataset/master_dataset_model_ready.csv': 'ML training data',
    'zipcodes.csv': 'Pincode to district mapping',
    'models/rf_severity_6feat.pkl': 'Trained Random Forest model',
    'models/lr_waterlogging_6feat.pkl': 'Trained Linear Regression model',
    'models/metadata_6feat.pkl': 'Model metadata',
    'models/rf_severity_recent.pkl': 'Recent data RF model',
    'models/lr_waterlogging_recent.pkl': 'Recent data LR model',
    'models/metadata_recent.pkl': 'Recent model metadata'
}

# Check which essential datasets exist and are referenced
print("Essential Datasets:")
for dataset, description in essential_datasets.items():
    exists = os.path.exists(dataset)
    referenced = dataset in referenced_datasets
    status = "KEEP" if exists and referenced else "MISSING"
    print(f"  {status:6} | {dataset:50} | {description}")

# Find unused datasets
unused_datasets = []
for dataset in all_datasets:
    if dataset not in referenced_datasets and dataset not in essential_datasets:
        unused_datasets.append(dataset)

print(f"\nUnused Datasets ({len(unused_datasets)}):")
for dataset in sorted(unused_datasets):
    size = os.path.getsize(dataset) / (1024*1024) if os.path.exists(dataset) else 0
    print(f"  ARCHIVE | {dataset:50} | {size:.1f}MB")

# 4. ANALYZE SPECIFIC UNUSED DATASETS
print(f"\n\n4. ANALYSIS OF UNUSED DATASETS")
print("-" * 40)

# Group unused datasets by folder
unused_by_folder = {}
for dataset in unused_datasets:
    folder = os.path.dirname(dataset)
    if folder not in unused_by_folder:
        unused_by_folder[folder] = []
    unused_by_folder[folder].append(dataset)

for folder, datasets in unused_by_folder.items():
    print(f"\n{folder}:")
    for dataset in datasets:
        filename = os.path.basename(dataset)
        size = os.path.getsize(dataset) / (1024*1024) if os.path.exists(dataset) else 0
        
        # Try to determine what the dataset might contain based on filename
        if 'pincode' in filename.lower():
            likely_content = "Pincode data (duplicate?)"
        elif 'all_india' in filename.lower():
            likely_content = "All India data (not used in current scope)"
        elif 'test' in filename.lower() or 'sample' in filename.lower():
            likely_content = "Test/sample data"
        elif 'backup' in filename.lower() or 'old' in filename.lower():
            likely_content = "Backup/old version"
        elif 'temp' in filename.lower():
            likely_content = "Temporary data"
        else:
            likely_content = "Unknown content"
        
        print(f"    {filename:40} | {size:.1f}MB | {likely_content}")

# 5. CREATE ARCHIVE PLAN
print(f"\n\n5. ARCHIVE PLAN")
print("-" * 40)

total_unused_size = sum(os.path.getsize(dataset) for dataset in unused_datasets if os.path.exists(dataset)) / (1024*1024)

print(f"Datasets to archive: {len(unused_datasets)}")
print(f"Total size to archive: {total_unused_size:.1f}MB")
print(f"Archive folder: unused_datasets/")

print(f"\nRecommended actions:")
print("1. Create 'unused_datasets/' folder")
print("2. Move all unused datasets there")
print("3. Create README in archive folder explaining contents")
print("4. Update any documentation if needed")

# 6. VERIFICATION - Double check no critical datasets are missed
print(f"\n\n6. VERIFICATION CHECK")
print("-" * 40)

# Check if any unused datasets might be needed
potentially_important = []
for dataset in unused_datasets:
    filename = os.path.basename(dataset).lower()
    
    # Check for potentially important datasets
    if 'all_india' in filename and 'pincode' in filename:
        potentially_important.append((dataset, "All India pincode data - might be useful for expansion"))
    elif 'master' in filename and 'dataset' in filename:
        potentially_important.append((dataset, "Master dataset - check if different version"))
    elif 'model' in filename and 'pkl' in filename:
        potentially_important.append((dataset, "ML model file - check if needed"))

if potentially_important:
    print("Potentially important datasets to review:")
    for dataset, reason in potentially_important:
        print(f"  REVIEW | {dataset:50} | {reason}")
else:
    print("No potentially important datasets identified for review")

print(f"\nSummary:")
print(f"- Essential datasets: {len([d for d in essential_datasets if os.path.exists(d)])}")
print(f"- Referenced datasets: {len(referenced_datasets)}")
print(f"- Unused datasets: {len(unused_datasets)}")
print(f"- Total dataset files: {len(all_datasets)}")
