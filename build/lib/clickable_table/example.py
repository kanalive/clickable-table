import streamlit as st
from clickable_table import clickable_table
import pandas as pd

st.subheader("Test Clickable Table")

data = {
'Epoch': ["R 1", "R 2", "R 3", "R 4", "R 5", "R 6", "R 7", "R 8"],
'C 1': [0.081, -1.164, -1.635, -1.515, -1.460, -1.306, -1.136, -1.222],
'C 2': [-0.505, 1.461, 1.596, 1.510, 1.406, 1.241, 1.198, 0.932],
'C 3': [0.987, -1.527, -1.583, -1.475, -1.348, -1.261, -1.037, -0.851],
'C 4': [-1.226, 1.553, 1.552, 1.429, 1.352, 1.150, 0.966, 0.782],
'C 5': [1.290, 1.382, 1.361, 1.268, 1.160, 1.028, 0.899, None]  
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

    styler = styler.applymap(apply_conditional_formatting)

    return styler


# Creating the DataFrame
df = pd.DataFrame(data)
df = df.set_index("Epoch")
# Suppress the index name to prevent pandas from rendering it as a separate row
df.index.name = None
styled_df = style_dataframe(df, "#C5C5C5", "#C5C5C5")
config = {
        'data_bar_chart_columns':[{'col_idx': 2, 'min': -1, 'max': 1}], 
        'idx_col_name':'Tenor Bucket',
        'column_width':['100px','100px','150px','100px','100px','100px']}
html = styled_df.render()

return_value = clickable_table(key="test", html = html, config=config)
st.markdown("Return value from react %s" % return_value)
