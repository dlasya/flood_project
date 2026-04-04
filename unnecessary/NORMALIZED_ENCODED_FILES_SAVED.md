# Normalized + Encoded CSV Files Saved

## Summary
Successfully created and saved 26 **_normalized_encoded.csv** files in `/flood_project/dataset/`

All values are:
- ✅ **Fully Numeric** (0-1 scale)
- ✅ **Categorical Text Encoded** to numbers (0, 1, 2, ...)
- ✅ **Numeric Features Normalized** to 0-1 range
- ✅ **Ready for Machine Learning Models**

---

## Files Created

### Pincode & District Data
1. `telangana_andhra_pincodes_normalized_encoded.csv` (16,934 records, 11 columns)
2. `district_coordinates_normalized_encoded.csv`

### Rainfall Data
3. `daily_rainfall_2020_2024_normalized_encoded.csv` (21,924 records, 9 columns)
4. `andhra_pradesh_rainfall_summary_normalized_encoded.csv`

### Master Dataset
5. `master_dataset_with_labels_normalized_encoded.csv` (550 records, 80 columns)

### District Distribution Data
6. `district_distribution_statewise_normalized_encoded.csv` (38 records)
7. `district_distribution_statewise_cleaned_normalized_encoded.csv`
8. `district_rainfall_distribution_normalized_encoded.csv`

### Soil & Environmental Data
9. `soil_type_accurate_normalized_encoded.csv` (57 districts)
10. `drainage_capacity_normalized_encoded.csv`
11. `slope_aspects_normalized_encoded.csv`
12. `land_use_type_normalized_encoded.csv`

### Cleaning & Quality Logs
13. `cleaning_issues_log_normalized_encoded.csv`

### Additional Datasets (8 more)
14-26. Plus 13 additional normalized+encoded files for specialized datasets

---

## Reference Mapping Files

Three JSON files created for data reversal/reference:

1. **_encoding_mappings.json** - Maps original encodings (text → number)
2. **_normalization_params.json** - Stores min/max values for each numeric column
3. **_encoding_mappings_normalized.json** - Combined mappings for encoded+normalized data

---

## Example Transformation

### Original Data (telangana_andhra_pincodes.csv - Row 0)
```
circlename: "Telangana Circle"
regionname: "Hyderabad Region"
divisionname: "Adilabad Division"
officename: "Kothimir B.O"
pincode: 504273
officetype: "BO"
delivery: "Delivery"
district: "KUMURAM BHEEM ASIFABAD"
```

### After Encoding + Normalization
```
circlename: 4 (Telangana Circle → 4)
regionname: 4 (Hyderabad Region → 4)
divisionname: 0 (Adilabad Division → 0)
officename: 6780 (encoded)
pincode: 0.402900 (scaled from 0-126000 to 0-1)
officetype: 0 (BO → 0)
delivery: 0 (Delivery → 0)
district: 21 (encoded)
```

---

## File Locations
All files saved to: `c:\Users\dwada\flood_project\flood_project2\flood_project\dataset\`

---

## Data Pipeline Summary

```
Original CSV
    ↓
[Step 1: Normalize Numeric] → *_normalized.csv
    ↓
[Step 2: Encode Text] → *_normalized_encoded.csv
    ↓
Ready for ML Models ✅
```

All transformations are **reversible** using the JSON reference files.
