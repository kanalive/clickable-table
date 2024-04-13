import os
import streamlit.components.v1 as components

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

    # st.subheader("Test Clickable Table")

    # data = {
    # 'Epoch': ["R 1", "R 2", "R 3", "R 4", "R 5", "R 6", "R 7", "R 8"],
    # 'C 1': [0.081, -1.164, -1.635, -1.515, -1.460, -1.306, -1.136, -1.222],
    # 'C 2': [-0.505, 1.461, 1.596, 1.510, 1.406, 1.241, 1.198, 0.932],
    # 'C 3': [0.987, -1.527, -1.583, -1.475, -1.348, -1.261, -1.037, -0.851],
    # 'C 4': [-1.226, 1.553, 1.552, 1.429, 1.352, 1.150, 0.966, 0.782],
    # 'C 5': [1.290, 1.382, 1.361, 1.268, 1.160, 1.028, 0.899, None]  
    # }

    # def style_dataframe(df, header_color, index_color):
    #     # Function to apply conditional formatting
    #     def apply_conditional_formatting(val):
    #         if val > 1.5:
    #             color = "#FFC0CB"  
    #         elif val < -1.5:
    #             color = "#90EE90"  
    #         else:
    #             color = ''
    #         return f'background-color: {color}'

    #     # Define header and index styles
    #     styles = [
    #         {'selector': 'thead th', 'props': [('background-color', header_color)]},
    #         {'selector': 'tbody th', 'props': [('background-color', index_color)]}
    #     ]

    #     # Initialize Styler object with table styles
    #     styler = df.style.set_table_styles(styles)

    #     styler = styler.applymap(apply_conditional_formatting)

    #     return styler


    # # Creating the DataFrame
    # df = pd.DataFrame(data)
    # df = df.set_index("Epoch")
    # # Suppress the index name to prevent pandas from rendering it as a separate row
    # df.index.name = None
    # styled_df = style_dataframe(df, "#C5C5C5", "#C5C5C5")
    # html = styled_df.render()

    # return_value = _component_func(key="test", html = html)
    # st.markdown("Return value from react %s" % return_value)

    # st.dataframe(styled_df)
else:
   
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir,  "frontend\\build")
    _component_func = components.declare_component("clickable_table", path=build_dir)

def clickable_table(html="", key=None):
    
    component_value = _component_func(html=html, key=key, default=0)

    
    return component_value
