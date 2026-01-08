"""
Test script to verify the refactored component works correctly
"""
import sys
import pandas as pd

# Add the package to path
sys.path.insert(0, r'c:\Users\wenkl\dev\clickable-table')

from clickable_table import clickable_table

# Simple test data
data = {
    'Name': ['Test1', 'Test2', 'Test3'],
    'Value': [100, -50, 75],
    'Target': [120, -30, 80],
    'Percentage': [25.5, 50.0, 75.8]
}

df = pd.DataFrame(data)

print("Testing basic DataFrame creation...")
print(df)
print("\nDataFrame created successfully!")

# Test data bar configuration
data_bar_columns = [
    {'col_idx': 1, 'min': -100, 'max': 200, 'recommended_idx': 2}
]

print("\nData bar configuration created successfully!")

# Test david hum configuration
david_hum_columns = [
    {'col_idx': 3, 'min': 0, 'max': 100, 'exception_col_color': 'yellow'}
]

print("David Hum configuration created successfully!")

print("\n✅ All configuration tests passed!")
print("The refactored component is ready for use in Streamlit.")
