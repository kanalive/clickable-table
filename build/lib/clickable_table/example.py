import streamlit as st
from clickable_table import clickable_table
import pandas as pd

st.set_page_config(layout="wide")
st.subheader("Clickable Table with Enhanced Features")

# Sample data
data = {
    'Epoch': ["R 1", "R 2", "R 3", "R 4", "R 5", "Total"],
    'Revenue': [2087627, -872765, -145564, -337304, 74001, 805085],
    'Revenue Target': [2500000, -500000, 0, -200000, 100000, 900000],  # Target revenue values
    'Margin %': [83.5, -34.9, -11.7, -33.7, 7.4, 32.2],
    'Margin % Target': [90.0, -20.0, 0.0, -25.0, 10.0, 40.0],  # Target margin values
    'Growth': [0.987, -1.527, -1.583, -1.475, -1.348, -1.261],
    'Customer Score': ['Below Average', 20.0, 59.2, 33.2, 90.0, 'Above Average'],
    'Employee Score': [45.0, 'Good', 62.5, 28.7, 75.2, 'Excellent'],
    'Long Term High': [1.290, 1.382, 1.361, 1.268, 1.160, 1.028],  
    'Long Term Low': [0.260, 0.218, 0.353, 0.296, 0.266, 0.390],  
    'Short Term High': [1.176, 1.371, 1.010, 1.153, 0.889, 0.986],  
    'Short Term Low': [0.871, 1.357, 0.876, 1.043, 0.858, 0.601],  
    'Current': [1.166, 1.365, 0.997, 1.110, 0.863, 0.709],
    'Range Chart': ["", "", "", "", "", ""]  
}

def style_dataframe(df):
    """Apply styling to the DataFrame"""
    # Function to apply conditional formatting
    def apply_conditional_formatting(val):
        try:
            val = float(val)
            if val > 1.5:
                return 'background-color: #FFC0CB'  # Light red
            elif val < -1.5:
                return 'background-color: #90EE90'  # Light green
        except (ValueError, TypeError):
            pass
        return ''

    # Apply the styling
    return df.style.applymap(apply_conditional_formatting)

# Create and prepare DataFrame
df = pd.DataFrame(data)
df = df.set_index("Epoch")
df.index.name = None

# Component configurations with custom line colors
data_bar_columns = [
    {
        'col_idx': 1, 
        'min': -1000000, 
        'max': 2500000, 
        'recommended_idx': 2,
        'line_color': '#FF0000'  # Red line for revenue
    },
    {
        'col_idx': 3, 
        'min': -50, 
        'max': 100, 
        'recommended_idx': 4,
        'line_color': '#0000FF'  # Blue line for margin
    }
]

david_hum_columns = [
    {'col_idx': 6, 'min': 0, 'max': 100, 'exception_col_color': "yellow"},
    {'col_idx': 7, 'min': 0, 'max': 100, 'exception_col_color': "lightblue"}
]

range_chart = [
    {'col_idx': 13, 
     'long_term_high_idx': 8,
     'long_term_low_idx': 9,
     'short_term_high_idx': 10,
     'short_term_low_idx': 11,
     'current_idx': 12, 
     'long_term_color': 'blue', 
     'short_term_color': 'green', 
     'current_color': 'black'
    }
]

column_width = [
    '100px', '130px', '130px', '100px', '130px', '100px', '130px', '130px',
    '100px', '100px', '100px', '100px', '100px', '150px'
]

# Columns to hide (target columns and calculation columns)
hidden_columns = [2, 4, 8, 9, 10, 11]  # Hide target columns and range calculation columns

# Create the clickable table
return_value = clickable_table(
    df=df,
    # styling_function=style_dataframe,
    data_bar_columns=data_bar_columns,
    david_hum_columns=david_hum_columns,
    range_chart=range_chart,
    idx_col_name='Tenor Bucket',
    column_width=column_width,
    hidden_columns=hidden_columns,
    max_height="300px",
    key="test"
)

# Display return value when cell is clicked
if return_value:
    st.markdown(f"### Selected Cell")
    st.json(return_value)
else:
    st.markdown("Click on a cell to see its details")

# Add explanation of new features
st.markdown("""
### Enhanced Features

This table now includes:

1. **Custom Line Colors**: 
   - Revenue target uses red lines
   - Margin target uses blue lines
   - The line color is fully customizable for each data bar column

2. **Hover Tooltips**:
   - Hover over any data bar chart cell to see a tooltip
   - The tooltip shows both the actual and target values
   - Column names are used in the tooltip for clarity

Try hovering over the Revenue or Margin % columns to see the tooltips in action!
""")