#!/usr/bin/env python3
"""
Rainfall Data Extraction Script
================================
This script extracts rainfall data from various sources and processes it
for use in the flood prediction models.
"""

import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta

def extract_rainfall_from_csv(input_file, output_file):
    """
    Extract rainfall data from a CSV file and process it for model training.
    
    Args:
        input_file (str): Path to input CSV file
        output_file (str): Path to output processed CSV file
    """
    try:
        # Read the input CSV
        df = pd.read_csv(input_file)
        print(f"Loaded {len(df)} records from {input_file}")
        
        # Basic data cleaning and processing
        # Add your specific rainfall data processing logic here
        
        # Example: Convert rainfall units if needed
        if 'rainfall_mm' in df.columns:
            df['rainfall_mm'] = pd.to_numeric(df['rainfall_mm'], errors='coerce')
        
        # Example: Filter out invalid rainfall values
        if 'rainfall_mm' in df.columns:
            df = df[(df['rainfall_mm'] >= 0) & (df['rainfall_mm'] <= 1000)]
        
        # Save processed data
        df.to_csv(output_file, index=False)
        print(f"Processed data saved to {output_file}")
        print(f"Final dataset contains {len(df)} records")
        
        return df
        
    except FileNotFoundError:
        print(f"Error: Input file {input_file} not found")
        return None
    except Exception as e:
        print(f"Error processing rainfall data: {str(e)}")
        return None

def main():
    """Main function to run rainfall extraction."""
    # Example usage
    input_file = "dataset/rainfall_raw.csv"
    output_file = "dataset/rainfall_processed.csv"
    
    if os.path.exists(input_file):
        extract_rainfall_from_csv(input_file, output_file)
    else:
        print(f"Input file {input_file} does not exist. Please check the path.")
        print("This script is a template - modify it for your specific rainfall data source.")

if __name__ == "__main__":
    main()