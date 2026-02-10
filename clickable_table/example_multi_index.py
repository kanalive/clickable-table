"""
Example: Multi-level (MultiIndex) column headers with clickable_table.
This demonstrates support for pd.MultiIndex columns - hierarchical column headers.
"""
import streamlit as st
from clickable_table import clickable_table
import pandas as pd
import numpy as np

st.set_page_config(layout="wide")
st.title("Clickable Table - Multi-Level Index Example")

# ---------------------------------------------------------------------------
# Build a DataFrame with pd.MultiIndex columns
# ---------------------------------------------------------------------------
# Top level groups: "Revenue", "Margin", "Score", "Forecast"
# Each group has sub-columns underneath.

rows = ["Q1", "Q2", "Q3", "Q4", "Total"]

# Revenue group
revenue_actual = [2087627, -872765, -145564, -337304, 805085]
revenue_pct = [83.5, -34.9, -11.7, -33.7, 32.2]

# Margin group
margin_value = [0.987, -1.527, -1.583, -1.475, -1.261]
margin_recommended = [1.2, -1.0, 1.0, -1.8, -1.5]

# Score group
score_customer = ['Below Average', '20.0', '59.2', '33.2', 'Above Average']
score_employee = ['45.0', 'Good', '62.5', '28.7', 'Excellent']

# Forecast group: long/short term + current + chart placeholder + dots + fixed chart
long_term_high = [1.290, 1.382, 1.361, 1.268, 1.028]
long_term_low = [0.260, 0.218, 0.353, 0.296, 0.390]
short_term_high = [1.176, 1.371, 1.010, 1.153, 0.986]
short_term_low = [0.871, 1.357, 0.876, 1.043, 0.601]
current = [0.1, 1.365, 0.997, 1.110, 0.709]
range_chart_placeholder = ["", "", "", "", ""]
dot1 = [-0.5, 0.8, 0.2, 0.5, 0.1]
dot2 = [0.3, 1.2, 0.5, 0.8, 0.4]
dot3 = [-1.2, 0.5, -0.8, 0.2, -0.2]
fixed_chart_placeholder = ["", "", "", "", ""]

# Create MultiIndex columns
columns = pd.MultiIndex.from_tuples([
    ('Revenue', 'Actual'),          # col 1
    ('Revenue', '% Change'),        # col 2
    ('Margin', 'Value'),            # col 3
    ('Margin', 'Recommended'),      # col 4
    ('Score', 'Customer'),          # col 5
    ('Score', 'Employee'),          # col 6
    ('Forecast', 'LT High'),       # col 7
    ('Forecast', 'LT Low'),        # col 8
    ('Forecast', 'ST High'),       # col 9
    ('Forecast', 'ST Low'),        # col 10
    ('Forecast', 'Current'),       # col 11
    ('Forecast', 'Range Chart'),   # col 12
    ('Dots', 'Dot1'),              # col 13
    ('Dots', 'Dot2'),              # col 14
    ('Dots', 'Dot3'),              # col 15
    ('Dots', 'Fixed Scale'),       # col 16
])

data = np.column_stack([
    revenue_actual, revenue_pct,
    margin_value, margin_recommended,
    score_customer, score_employee,
    long_term_high, long_term_low, short_term_high, short_term_low,
    current, range_chart_placeholder,
    dot1, dot2, dot3, fixed_chart_placeholder,
])

df = pd.DataFrame(data, index=rows, columns=columns)
df.index.name = None

# Cast numeric columns explicitly (np.column_stack makes everything object dtype)
numeric_cols = [
    ('Revenue', 'Actual'), ('Revenue', '% Change'),
    ('Margin', 'Value'), ('Margin', 'Recommended'),
    ('Forecast', 'LT High'), ('Forecast', 'LT Low'),
    ('Forecast', 'ST High'), ('Forecast', 'ST Low'),
    ('Forecast', 'Current'),
    ('Dots', 'Dot1'), ('Dots', 'Dot2'), ('Dots', 'Dot3'),
]
for col in numeric_cols:
    df[col] = pd.to_numeric(df[col])

# Cast score columns to str to avoid Arrow issues
df[('Score', 'Customer')] = df[('Score', 'Customer')].astype(str)
df[('Score', 'Employee')] = df[('Score', 'Employee')].astype(str)

st.write("### MultiIndex DataFrame Structure")
st.write(f"Column levels: {df.columns.nlevels}")
st.write(f"Top-level groups: {df.columns.get_level_values(0).unique().tolist()}")
st.dataframe(df)


# ---------------------------------------------------------------------------
# Styling function (works with MultiIndex columns)
# ---------------------------------------------------------------------------
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


# ---------------------------------------------------------------------------
# Column index mapping (after the index column at position 0):
#
#  0: (index)
#  1: Revenue > Actual
#  2: Revenue > % Change
#  3: Margin > Value
#  4: Margin > Recommended
#  5: Score > Customer
#  6: Score > Employee
#  7: Forecast > LT High
#  8: Forecast > LT Low
#  9: Forecast > ST High
# 10: Forecast > ST Low
# 11: Forecast > Current
# 12: Forecast > Range Chart
# 13: Dots > Dot1
# 14: Dots > Dot2
# 15: Dots > Dot3
# 16: Dots > Fixed Scale
# ---------------------------------------------------------------------------

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

# Column widths - one per visible column (including index)
column_width = [
    '100px', '200px', '120px', '200px', '10px', '200px', '200px',
    '10px', '10px', '10px', '100px', '150px', '150px', '100px', '100px', '100px', '200px',
]

# Hide helper columns that provide data to charts
hidden_columns = [4, 7, 8, 9, 10, 13, 14, 15]

return_value = clickable_table(
    df=df,
    styling_function=style_dataframe,
    data_bar_columns=data_bar_columns,
    david_hum_columns=david_hum_columns,
    range_chart=range_chart,
    fixed_scale_range_chart=fixed_scale_range_chart,
    idx_col_name='Quarter',
    column_width=column_width,
    hidden_column_class="hide-column",
    hidden_columns=hidden_columns,
    max_height="400px",
    bar_rounded=True,
    key="multi_index_test",
)

if return_value:
    st.write("### Selected Cell")
    st.json(return_value)
else:
    st.write("Click on a cell to see details")
