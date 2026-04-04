import pandas as pd
import os
for fname in ['telangana_rainfall_summary.csv','andhra_pradesh_rainfall_summary.csv']:
    path=os.path.join('c:/Users/dwada/flood_project/dataset',fname)
    df=pd.read_csv(path)
    dup=df.duplicated(subset=['District','State','Year'],keep=False)
    print(fname,'duplicate rows count',dup.sum())
    if dup.sum()>0:
        print(df[dup].head())
    out=path.replace('.csv','_cleaned.csv')
    df.drop_duplicates(subset=['District','State','Year'],keep='first').to_csv(out,index=False)
    print('wrote',out)
