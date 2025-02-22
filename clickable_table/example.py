import streamlit as st
from clickable_table import clickable_table
import pandas as pd

st.set_page_config(layout="wide")
st.subheader("Test Clickable Table")

# Sample data
data = {
    'Epoch': ["R 1", "R 2", "R 3", "R 4", "R 5", "Total"],
    'C 1': [2087627, -872765, -145564, -337304, 74001, 805085],
    'C 2': [83.5, -34.9, -11.7, -33.7, 7.4, 32.2],
    'C 3': [0.987, -1.527, -1.583, -1.475, -1.348, -1.261],
    'C 4': ['Below Average', 20.0, 59.2, 33.2, 90.0, 'Above Average'],
    'C 5': [45.0, 'Good', 62.5, 28.7, 75.2, 'Excellent'],
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

# Format percentage values
df['C 2'] = pd.Series([f"{val:.1f}%" for val in df['C 2']], index=df.index)

# Component configurations
data_bar_columns = [
    {'col_idx': 1, 'min': -1000000, 'max': 2500000},  # C 1 column
    {'col_idx': 3, 'min': -2, 'max': 2}              # C 3 column
]

david_hum_columns = [
    {'col_idx': 4, 'min': 0, 'max': 100, 'exception_col_color': "yellow"},
    {'col_idx': 5, 'min': 0, 'max': 100, 'exception_col_color': "lightblue"}
]

range_chart = [
    {'col_idx': 11, 
     'long_term_high_idx': 6,
     'long_term_low_idx': 7,
     'short_term_high_idx': 8,
     'short_term_low_idx': 9,
     'current_idx': 10, 
     'long_term_color': 'blue', 
     'short_term_color': 'green', 
     'current_color': 'black'
    }
]

column_width = [
    '100px', '120px', '100px', '100px', '150px', '150px', 
    '100px', '100px', '100px', '100px', '100px', '150px'
]

# Specify columns to hide (indices for Long Term High/Low and Short Term High/Low)
hidden_columns = [6, 7, 8, 9]  # These columns will be hidden but still available for calculations

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

# Add explanation of visualizations
st.markdown("""
### Visualization Types
This table demonstrates multiple visualization types:

1. **Data Bar Charts** (columns C 1 and C 3):
   - Shows proportional bars for numeric values
   - Blue for positive values, red for negative values
   
2. **David Hum Charts** (columns C 4 and C 5):
   - Named after my colleague David Hum who requested this special feature
   - Shows percentage bars for numeric values
   - Text values are highlighted with custom background colors
   
3. **Range Chart** (last column):
   - Shows points for long/short term highs/lows and current value
   - The calculation columns are hidden but still used for calculations
   
4. **Hidden Columns**:
   - Calculation columns (Long/Short Term High/Low) are hidden from view
   - They're available for calculations but not visible to users
""")

# Show regular dataframe for comparison
st.markdown("### Regular DataFrame (for comparison)")
st.dataframe(df)