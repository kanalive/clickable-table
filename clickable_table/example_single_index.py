"""
Example: Single-level index DataFrame with clickable_table.
This demonstrates backward compatibility - standard DataFrames with flat column headers.
"""
import streamlit as st
from clickable_table import clickable_table
import pandas as pd

st.set_page_config(layout="wide")
st.title("Clickable Table - Single Level Index Example")

# Sample data with flat (single-level) column headers
data = {
    'Epoch': ["R 1", "R 2", "R 3", "R 4", "R 5", "Total"],
    'C 1': [2087627, -872765, -145564, -337304, 74001, 805085],
    'C 2': [83.5, -34.9, -11.7, -33.7, 7.4, 32.2],
    'C 3': [0.987, -1.527, -1.583, -1.475, -1.348, -1.261],
    'C 3 Recommended': [1.2, -1.0, 1.0, -1.8, 1.0, -1.5],
    'C 4': ['Below Average', '20.0', '59.2', '33.2', '90.0', 'Above Average'],
    'C 5': ['45.0', 'Good', '62.5', '28.7', '75.2', 'Excellent'],
    'Long Term High': [1.290, 1.382, 1.361, 1.268, 1.160, 1.028],
    'Long Term Low': [0.260, 0.218, 0.353, 0.296, 0.266, 0.390],
    'Short Term High': [1.176, 1.371, 1.010, 1.153, 0.889, 0.986],
    'Short Term Low': [0.871, 1.357, 0.876, 1.043, 0.858, 0.601],
    'Current': [0.1, 1.365, 0.997, 1.110, 0.863, 0.709],
    'Range Chart': ["", "", "", "", "", ""],
    'Dot1': [-0.5, 0.8, 0.2, 0.5, -0.3, 0.1],
    'Dot2': [0.3, 1.2, 0.5, 0.8, 0.0, 0.4],
    'Dot3': [-1.2, 0.5, -0.8, 0.2, -0.5, -0.2],
    'Fixed Scale Chart': ["", "", "", "", "", ""],
}


def style_dataframe(df):
    def apply_conditional_formatting(val):
        try:
            val = float(val)
            if val > 500:
                color = "#FFC0CB"
            elif val < -500:
                color = "#90EE90"
            else:
                color = ''
            return f'background-color: {color}'
        except (ValueError, TypeError):
            return None

    styler = df.style
    numeric_columns = df.select_dtypes(include=['number']).columns
    if len(numeric_columns) > 0:
        styler = styler.map(apply_conditional_formatting, subset=numeric_columns)
    return styler


# Creating the DataFrame
df = pd.DataFrame(data)

# Force specific columns to be string type to avoid Arrow conversion issues
df['C 4'] = df['C 4'].astype(str)
df['C 5'] = df['C 5'].astype(str)

st.write("### Regular DataFrame (for comparison)")
st.dataframe(df)

df = df.set_index("Epoch")
df.index.name = None

# Column indices after set_index("Epoch"):
# 0: (index), 1: C 1, 2: C 2, 3: C 3, 4: C 3 Recommended, 5: C 4, 6: C 5,
# 7: Long Term High, 8: Long Term Low, 9: Short Term High, 10: Short Term Low,
# 11: Current, 12: Range Chart, 13: Dot1, 14: Dot2, 15: Dot3, 16: Fixed Scale Chart

data_bar_columns = [
    {'col_idx': 1, 'min': -1000000, 'max': 2500000},
    {'col_idx': 3, 'min': -2, 'max': 2, 'recommended_idx': 4, 'line_color': '#000000'},
]

david_hum_columns = [
    {'col_idx': 5, 'min': 0, 'max': 100, 'exception_col_color': "yellow"},
    {'col_idx': 6, 'min': 0, 'max': 100, 'exception_col_color': "lightblue"},
]

range_chart = [
    {
        'col_idx': 12,
        'long_term_high_idx': 7,
        'long_term_low_idx': 8,
        'short_term_high_idx': 9,
        'short_term_low_idx': 10,
        'current_idx': 11,
        'long_term_color': 'blue',
        'short_term_color': 'green',
        'current_color': 'black',
        'low_text': 'Below Range',
        'high_text': 'Above Range',
    }
]

fixed_scale_range_chart = [
    {
        'col_idx': 16,
        'min': -1.5,
        'max': 1.5,
        'dot1_idx': 13,
        'dot2_idx': 14,
        'dot3_idx': 15,
        'dot1_color': '#EF4444',
        'dot2_color': '#6B7280',
        'dot3_color': '#D1D5DB',
        'line_color': '#D1D5DB',
        'line_height': 2,
        'tick_marks': True,
    }
]

column_width = [
    '100px', '200px', '120px', '200px', '10px', '200px', '200px',
    '10px', '10px', '10px', '100px', '150px', '150px', '100px', '100px', '100px', '200px',
]

hidden_columns = [4, 7, 8, 9, 10, 13, 14, 15]

return_value = clickable_table(
    df=df,
    styling_function=style_dataframe,
    data_bar_columns=data_bar_columns,
    david_hum_columns=david_hum_columns,
    range_chart=range_chart,
    fixed_scale_range_chart=fixed_scale_range_chart,
    idx_col_name='Tenor Bucket',
    column_width=column_width,
    hidden_column_class="hide-column",
    hidden_columns=hidden_columns,
    max_height="400px",
    bar_rounded=True,
    key="single_index_test",
)

if return_value:
    st.write("### Selected Cell")
    st.json(return_value)
else:
    st.write("Click on a cell to see details")
