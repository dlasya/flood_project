import pandas as pd

print("=== VERIFYING PINCODE 500018 ACTUAL LOCATION ===")

# Check what our dataset says
zipcodes_df = pd.read_csv('zipcodes.csv')
match = zipcodes_df[zipcodes_df['pincode'] == 500018]

print("DATASET RECORDS FOR 500018:")
if not match.empty:
    for idx, row in match.iterrows():
        print(f"  {row['district']}, {row['statename']}")
else:
    print("  No records found")

# Check Hyderabad and Rangareddy districts in our dataset
print(f"\n=== HYDERABAD DISTRICT IN DATASET ===")
hyderabad_zipcodes = zipcodes_df[zipcodes_df['district'].str.contains('Hyderabad', case=False, na=False)]
print(f"Found {len(hyderabad_zipcodes)} pincodes for Hyderabad district:")
if not hyderabad_zipcodes.empty:
    sample_hyd = hyderabad_zipcodes['pincode'].head(10).tolist()
    print(f"Sample Hyderabad pincodes: {sample_hyd}")

print(f"\n=== RANGAREDDY DISTRICT IN DATASET ===") 
rangareddy_zipcodes = zipcodes_df[zipcodes_df['district'].str.contains('Rangareddy', case=False, na=False)]
print(f"Found {len(rangareddy_zipcodes)} pincodes for Rangareddy district:")
if not rangareddy_zipcodes.empty:
    sample_rgr = rangareddy_zipcodes['pincode'].head(10).tolist()
    print(f"Sample Rangareddy pincodes: {sample_rgr}")

# Check Medchal Malkajgiri district
print(f"\n=== MEDCHAL MALKAJGIRI DISTRICT IN DATASET ===")
medchal_zipcodes = zipcodes_df[zipcodes_df['district'].str.contains('Medchal', case=False, na=False)]
print(f"Found {len(medchal_zipcodes)} pincodes for Medchal districts:")
if not medchal_zipcodes.empty:
    print("District names found:")
    districts = medchal_zipcodes['district'].unique()
    for district in districts:
        count = len(medchal_zipcodes[medchal_zipcodes['district'] == district])
        print(f"  {district}: {count} pincodes")

# Check the actual geographical reality
print(f"\n=== REALITY CHECK ===")
print("According to postal geography:")
print("- Pincode 500018: KPHB, Kukatpally, Hyderabad")
print("- This area should be in Hyderabad district or Rangareddy district")
print("- NOT in Medchal Malkajgiri district")

# Let's see what pincodes are actually in Hyderabad area
print(f"\n=== COMMON HYDERABAD AREA PINCODES ===")
common_hyd_pincodes = [500001, 500002, 500003, 500004, 500005, 500006, 500007, 500008, 500009, 500010, 500011, 500012, 500013, 500014, 500015, 500016, 500017, 500018, 500019, 500020]
for pin in common_hyd_pincodes:
    pin_match = zipcodes_df[zipcodes_df['pincode'] == pin]
    if not pin_match.empty:
        district = pin_match.iloc[0]['district']
        state = pin_match.iloc[0]['statename']
        print(f"  {pin}: {district}, {state}")
    else:
        print(f"  {pin}: NOT FOUND")
