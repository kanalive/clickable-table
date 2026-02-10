import streamlit as st
from clickable_table import clickable_table
import pandas as pd

st.set_page_config(layout="wide")
st.title("🎯 Clickable Table 1.0 - Enhanced Visualizations")
st.markdown("**A powerful, interactive table component for Streamlit with advanced visualization features**")

# Sample data - exactly matching __init__.py
data = {
    'Epoch': ["R 1", "R 2", "R 3", "R 4", "R 5", "Total"],
    'C 1': [2087627, -872765, -145564, -337304, 74001, 805085],
    'C 2': [83.5, -34.9, -11.7, -33.7, 7.4, 32.2],
    'C 3': [0.987, -1.527, -1.583, -1.475, -1.348, -1.261],
    'C 3 Recommended': [1.2, -1.0, 1.0, -1.8, 1.0, -1.5],  # Recommended values
    'C 4': ['Below Average', '20.0', '59.2', '33.2', '90.0', 'Above Average'],
    'C 5': ['45.0', 'Good', '62.5', '28.7', '75.2', 'Excellent'],
    'Long Term High': [1.290, 1.382, 1.361, 1.268, 1.160, 1.028],  
    'Long Term Low': [0.260, 0.218, 0.353, 0.296, 0.266, 0.390],  
    'Short Term High': [1.176, 1.371, 1.010, 1.153, 0.889, 0.986],  
    'Short Term Low': [0.871, 1.357, 0.876, 1.043, 0.858, 0.601],  
    'Current': [0.1, 1.365, 0.997, 1.110, 0.863, 0.709],
    'Range Chart': ["", "", "", "", "", ""],
    'Dot1': [-0.5, 0.8, 0.2, 0.5, -0.3, 0.1],  # Values for first dot
    'Dot2': [0.3, 1.2, 0.5, 0.8, 0.0, 0.4],   # Values for second dot
    'Dot3': [-1.2, 0.5, -0.8, 0.2, -0.5, -0.2], # Values for third dot
    'Fixed Scale Chart': ["", "", "", "", "", ""]  # Fixed-scale range chart column
}

def style_dataframe(df):
    # Function to apply conditional formatting
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

    # Initialize Styler object
    styler = df.style
    
    # Only apply styling to numeric columns to avoid Arrow conversion issues
    numeric_columns = df.select_dtypes(include=['number']).columns
    if len(numeric_columns) > 0:
        styler = styler.map(apply_conditional_formatting, subset=numeric_columns)
    
    return styler

# Creating the DataFrame
df = pd.DataFrame(data)

# Force specific columns to be string type to avoid Arrow conversion issues
df['C 4'] = df['C 4'].astype(str)
df['C 5'] = df['C 5'].astype(str)

# Show the regular dataframe for comparison
st.write("### Regular DataFrame (for comparison)")
st.dataframe(df)

df = df.set_index("Epoch")
df.index.name = None

# Example configuration for multiple columns of each type - exactly matching __init__.py
data_bar_columns = [
    {'col_idx': 1, 'min': -1000000, 'max': 2500000},  # C 1 column - numbers with wide range
    {'col_idx': 3, 'min': -2, 'max': 2, 'recommended_idx': 4, 'line_color': '#000000'}               # C 3 column - numbers with smaller range
]

david_hum_columns = [
    {'col_idx': 5, 'min': 0, 'max': 100, 'exception_col_color': "yellow"},  # C 4 column
    {'col_idx': 6, 'min': 0, 'max': 100, 'exception_col_color': "lightblue"} # C 5 column
]

range_chart = [
    {'col_idx': 12, 
     'long_term_high_idx': 7,
     'long_term_low_idx': 8,
     'short_term_high_idx': 9,
     'short_term_low_idx': 10,
     'current_idx': 11, 
     'long_term_color': 'blue', 
     'short_term_color': 'green', 
     'current_color': 'black',
     'low_text': '⚠️ Below Range',  # Text when current < both lows
     'high_text': '⚠️ Above Range'  # Text when current > both highs
    }
]

# Fixed-scale range chart example
# After set_index("Epoch"), column indices are 0-based:
# 0: C 1, 1: C 2, 2: C 3, 3: C 3 Recommended, 4: C 4, 5: C 5,
# 6: Long Term High, 7: Long Term Low, 8: Short Term High, 9: Short Term Low,
# 10: Current, 11: Range Chart, 12: Dot1, 13: Dot2, 14: Dot3, 15: Fixed Scale Chart
# Wait, user says current_idx is 11, Range Chart is 12, so:
# 11: Current, 12: Range Chart, 13: Dot1, 14: Dot2, 15: Dot3, 16: Fixed Scale Chart
fixed_scale_range_chart = [
    {
        'col_idx': 16,              # Fixed Scale Chart column (index 16 after setting Epoch as index)
        'min': -1.5,                 # Fixed minimum for entire table
        'max': 1.5,                  # Fixed maximum for entire table
        'dot1_idx': 13,              # Dot1 column index (13, after Range Chart at 12)
        'dot2_idx': 14,              # Dot2 column index (14)
        'dot3_idx': 15,              # Dot3 column index (15)
        'dot1_color': '#EF4444',     # Red for first dot
        'dot2_color': '#6B7280',     # Darker grey for second dot
        'dot3_color': '#D1D5DB',     # Lighter grey for third dot
        'line_color': '#D1D5DB',     # Grey line
        'line_height': 2,
        'tick_marks': True
    }
]

column_width = [
    '100px','200px', '120px', '200px', '10px', '200px', '200px',
    '10px', '10px', '10px', '100px', '150px', '150px', '100px', '100px', '100px', '200px'
]

# Columns to be hidden
hidden_columns = [4, 7, 8, 9, 10, 13, 14, 15]  # Long/Short Term High/Low columns and dot value columns

# The CSS for hiding columns is defined in app.css (.hide-column { display: none !important; })
# No need to add additional CSS in Streamlit

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
    max_height="300px",
    bar_rounded=True,  # Set to False for square edges on all bars
    key="test"
)

if return_value:
    st.write("### Selected Cell")
    st.json(return_value)
else:
    st.write("Click on a cell to see details")

# Add explanation of new 1.0 features
st.markdown("""
## 🚀 Version 1.0 Features

### ✨ **Complete Visual Refresh**
- **Rounded bars** with consistent styling across all columns
- **Centered axis** with neutral colors for better readability
- **Softer palette** with improved contrast and accessibility
- **Unified design** - all data bars now have the same modern look

### 📊 **Enhanced Range Charts**
- **Band design** instead of scattered dots for clearer range visualization
- **Current marker** as a pill-shaped indicator
- **Palette options** (muted, professional, warm/cool, grayscale)
- **Smart text display** when values are outside expected ranges

### 🎯 **Improved Recommendation Markers**
- **Medium-gray styling** for better visual balance
- **Overlap-aware text positioning** - values flip to opposite side when marker is present
- **Cleaner connectors** from marker to center axis
- **Enhanced readability** with better contrast

### 🔧 **Technical Improvements**
- **Consistent bar heights** (18px) across all visualizations
- **Better error handling** and data type consistency
- **Improved performance** and stability
- **Accessibility enhancements** with better color contrast

### 💡 **Try These Features**
- **Hover** over Revenue or Margin % columns to see tooltips
- **Click** any cell to see detailed information
- **Notice** the clean, modern styling throughout
- **Observe** how text positioning adapts to recommendation markers
""")

# Add a section showing the different visualization types
st.markdown("---")
st.markdown("### 📈 Visualization Types")

col1, col2, col3 = st.columns(3)

with col1:
    st.markdown("""
    **Data Bar Charts**
    - C 1: Blue/red bars with rounded ends
    - C 3: Includes recommendation markers
    - Hover tooltips show actual vs target
    """)

with col2:
    st.markdown("""
    **David Hum Charts**
    - C 4/C 5: Customer/Employee scores
    - Exception highlighting for text values
    - Consistent rounded styling
    """)

with col3:
    st.markdown("""
    **Range Charts**
    - Long/short-term bands
    - Current value marker
    - Text display for out-of-range values
    """)

st.markdown("---")
st.markdown("### 🎯 Fixed-Scale Range Chart")
st.markdown("""
**New in this version!** The Fixed-Scale Range Chart provides a consistent scale across all rows:
- **Fixed min/max** values for the entire table (e.g., -1.5 to 1.5)
- **Auto-generated tick marks** (7 ticks: 3 left, midpoint, 3 right)
- **Three dots per row** with customizable colors (red, darker grey, lighter grey)
- **Midpoint reference line** for easy visualization
- **Grey horizontal line** for each row
- Perfect for comparing values across rows on the same scale
""")
