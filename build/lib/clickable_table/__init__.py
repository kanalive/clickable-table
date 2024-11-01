import os
import streamlit.components.v1 as components
import streamlit as st
import pandas as pd

# Create a _RELEASE constant. We'll set this to False while we're developing
# the component, and True when we're ready to package and distribute it.
# (This is, of course, optional - there are innumerable ways to manage your
# release process.)
_RELEASE = True
# import pandas as pd
# import streamlit as st
# Declare a Streamlit component. `declare_component` returns a function
# that is used to create instances of the component. We're naming this
# function "_component_func", with an underscore prefix, because we don't want
# to expose it directly to users. Instead, we will create a custom wrapper
# function, below, that will serve as our component's public API.

# It's worth noting that this call to `declare_component` is the
# *only thing* you need to do to create the binding between Streamlit and
# your component frontend. Everything else we do in this file is simply a
# best practice.

if not _RELEASE:
    _component_func = components.declare_component(
      
        "clickable_table",
       
        url="http://localhost:3001",
    )
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
            except ValueError:
                return None

           

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
    # df['C 2'] = pd.Series(["{0:.1f}%".format(val) for val in df['C 2']], index = df.index)

    st.dataframe(df)
    df.index.name = None

    styled_df = style_dataframe(df)
    html = styled_df.render()

    max_height = "300px"

    config = {
        'data_bar_chart_columns':[{'col_idx': 2, 'min': -100, 'max': 100}], 
        'david_hum_columns':[{'col_idx': 4, 'min': 0, 'max': 100, 'exception_col_color': "yellow"}], 
        'idx_col_name':'Tenor Bucket',
        'column_width':['100px','100px','150px','100px','150px','100px','100px','100px','100px','100px'],
        'range_chart':[{'col_idx':10, 'long_term_high_idx':5,'long_term_low_idx':6,'short_term_high_idx':7,'short_term_low_idx':8,'current_idx':9, 'long_term_color':'blue', 'short_term_color':'green', 'current_color':'black'}]
        # 'range_chart':[]
    }
    return_value = _component_func(key="test", html = html, config = config, max_height = max_height)
    st.markdown("Return value from react %s" % return_value)

    st.dataframe(styled_df)
else:
   
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir,  "frontend\\build")
    _component_func = components.declare_component("clickable_table", path=build_dir)

def clickable_table(html="", key=None, config = None, max_height = None):
    
    component_value = _component_func(html=html, key=key, config=config, max_height = max_height, default=0)

    
    return component_value
