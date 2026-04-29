import pandas as pd

# Test the corrected mapping
zipcodes_df = pd.read_csv('zipcodes.csv')
labeled_df = pd.read_csv('dataset/master_dataset_with_labels.csv')

# Test pincode 500018 with the new logic
pincode = 500018
hyderabad_pincodes = [500018, 500010, 500013]

match = zipcodes_df[zipcodes_df['pincode'] == pincode]
if not match.empty:
    row = match.iloc[0]
    district_name = str(row['district']).strip()
    state_name_upper = str(row['statename']).strip().upper()
    state_name = 'Telangana' if state_name_upper == 'TELANGANA' else 'Andhra Pradesh'
    
    print(f"Pincode {pincode}:")
    print(f"  Dataset shows: {district_name}, {state_name}")
    
    # Apply the new logic
    if pincode in hyderabad_pincodes:
        mapped_district = "Hyderabad"
        print(f"  CORRECTED to: {mapped_district}, {state_name}")
    else:
        mapped_district = district_name
        print(f"  Using original: {mapped_district}, {state_name}")
    
    # Check if this district has data
    sub = labeled_df[
        (labeled_df['District'].str.strip().str.upper() == mapped_district.upper()) &
        (labeled_df['State'].str.strip().str.upper() == state_name.upper())
    ]
    
    print(f"  Data records found: {len(sub)}")
    if len(sub) > 0:
        print(f"  Average rainfall: {sub['Monsoon_Rainfall_mm'].mean():.2f}")
        print(f"  SUCCESS: Using real Hyderabad data!")
    else:
        print(f"  ERROR: No data found!")

print(f"\n=== TESTING OTHER HYDERABAD PINCODES ===")
for pin in [500010, 500013]:
    match = zipcodes_df[zipcodes_df['pincode'] == pin]
    if not match.empty:
        row = match.iloc[0]
        district_name = str(row['district']).strip()
        print(f"Pincode {pin}: {district_name} -> Hyderabad (corrected)")
