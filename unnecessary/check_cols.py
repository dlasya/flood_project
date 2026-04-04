import pandas as pd
df = pd.read_csv('flood_project/dataset/master_dataset_with_labels.csv')
print('Looking for non-numeric columns:')
for col in df.columns:
    if df[col].dtype == 'object' or df[col].dtype == 'string':
        print(f'{col}: {df[col].unique()[:5]}')
