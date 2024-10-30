import streamlit as st
from clickable_table import clickable_table
import pandas as pd
st.set_page_config(layout="wide")

st.subheader("Test Clickable Table")


data = {
    'Epoch': ["R 1", "R 2", "R 3", "R 4", "R 5", "Total"],
    'C 1': [2087627, -872765, -145564, -337304, 74001, 805085],
    'C 2': [83.5, -34.9, -11.7, -33.7, 7.4, 32.2],
    'C 3': [0.987, -1.527, -1.583, -1.475, -1.348, -1.261],
    'C 4': ['Below Average', 20.0, 59.2, 33.2, 90.0, 'Above Average'],
    'Long Term High': [1.290, 1.382, 1.361, 1.268, 1.160, 1.028],  
    'Long Term Low': [0.260, 0.218, 0.353, 0.296, 0.266, 0.390],  
    'Short Term High': [1.176, 1.371, 1.010, 1.153, 0.889, 0.986],  
    'Short Term Low': [0.871, 1.357, 0.876, 1.043, 0.858, 0.601],  
    'Current': [1.166, 1.365, 0.997, 1.110, 0.863, 0.709],
    'Range Chart': ["", "", "", "", "", ""]  
    }

def style_dataframe(df, header_color, index_color):
    # Function to apply conditional formatting
    def apply_conditional_formatting(val):
        if val > 1.5:
            color = "#FFC0CB"  
        elif val < -1.5:
            color = "#90EE90"  
        else:
            color = ''
        return f'background-color: {color}'

    # Define header and index styles
    styles = [
        # {'selector': 'thead th', 'props': [('background-color', header_color)]},
        # {'selector': 'tbody th', 'props': [('background-color', index_color)]}
    ]

    # Initialize Styler object with table styles
    styler = df.style.set_table_styles(styles)

    # styler = styler.applymap(apply_conditional_formatting)

    return styler


# Creating the DataFrame
df = pd.DataFrame(data)
df = df.set_index("Epoch")
# Suppress the index name to prevent pandas from rendering it as a separate row
df.index.name = None
styled_df = style_dataframe(df, "#C5C5C5", "#C5C5C5")
config = {
        'data_bar_chart_columns':[{'col_idx': 2, 'min': -100, 'max': 100}], 
        'david_hum_columns':[{'col_idx': 4, 'min': 0, 'max': 100, 'exception_col_color': "yellow"}], 
        'idx_col_name':'Tenor Bucket',
        'column_width':['100px','100px','150px','100px','150px','100px','100px','100px','100px','100px'],
        # 'range_chart':[{'col_idx':10, 'long_term_high_idx':5,'long_term_low_idx':6,'short_term_high_idx':7,'short_term_low_idx':8,'current_idx':9, 'long_term_color':'blue', 'short_term_color':'green', 'current_color':'black'}]
    }
max_height = "300px"
html = styled_df.render()

return_value = clickable_table(key="test", html = html, config=config, max_height=max_height)
st.markdown("Return value from react %s" % return_value)
