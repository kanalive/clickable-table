import streamlit as st
from my_component import my_component 
import pandas as pd
# Add some test code to play with the component while it's in development.
# During development, we can run this just as we would any other Streamlit
# app: `$ streamlit run my_component/example.py`

st.subheader("Test Clickable Table")

data = {
'Epoch': ["1 Fut", "2 Fut", "3 Fut", "4 Fut", "5 Fut", "6 Fut", "7 Fut", "8 Fut"],
'2 Fut': [0.081, -1.164, -1.635, -1.515, -1.460, -1.306, -1.136, -1.222],
'3 Fut': [-0.505, 1.461, 1.596, 1.510, 1.406, 1.241, 1.198, 0.932],
'4 Fut': [0.987, -1.527, -1.583, -1.475, -1.348, -1.261, -1.037, -0.851],
'5 Fut': [-1.226, 1.553, 1.552, 1.429, 1.352, 1.150, 0.966, 0.782],
'6 Fut': [1.290, 1.382, 1.361, 1.268, 1.160, 1.028, 0.899, None]  # Assuming the last entry is missing or NaN
}

def style_dataframe(df, header_color, index_color):
    # Function to apply conditional formatting
    def apply_conditional_formatting(val):
        if val > 0:
            color = "#FFC0CB"  # Light pink for positive values in '3 Fut'
        elif val < 0:
            color = "#90EE90"  # Light green for negative values in '5 Fut'
        else:
            color = ''
        return f'background-color: {color}'

    # Define header and index styles
    styles = [
        {'selector': 'thead th', 'props': [('background-color', header_color)]},
        {'selector': 'tbody th', 'props': [('background-color', index_color)]}
    ]

    # Initialize Styler object with table styles
    styler = df.style.set_table_styles(styles)

    # Apply conditional formatting to the '3 Fut' column for positive values
    if '3 Fut' in df.columns:
        styler = styler.applymap(apply_conditional_formatting, subset=['3 Fut'])

    # Apply conditional formatting to the '5 Fut' column for negative values
    if '5 Fut' in df.columns:
        styler = styler.applymap(apply_conditional_formatting, subset=['5 Fut'])

    return styler


# Creating the DataFrame
df = pd.DataFrame(data)
df = df.set_index("Epoch")
# Suppress the index name to prevent pandas from rendering it as a separate row
df.index.name = None
styled_df = style_dataframe(df, "#C5C5C5", "#C5C5C5")
html = styled_df.render()

return_value = my_component(key="test", html = html)
st.markdown("Return value from react %s" % return_value)
