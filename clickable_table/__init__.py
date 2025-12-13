import os
import streamlit.components.v1 as components
import streamlit as st
import pandas as pd

# Create a _RELEASE constant. We'll set this to False while we're developing
# the component, and True when we're ready to package and distribute it.
_RELEASE = True

# Declare a Streamlit component. `declare_component` returns a function
# that is used to create instances of the component.
if not _RELEASE:
    _component_func = components.declare_component(
        "clickable_table",
        url="http://localhost:3001",
    )
else:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _component_func = components.declare_component("clickable_table", path=build_dir)

def clickable_table(df=None, styling_function=None, data_bar_columns=None, david_hum_columns=None, 
                   range_chart=None, fixed_scale_range_chart=None, idx_col_name=None, column_width=None, max_height="800px", 
                   hidden_column_class="hide-column", hidden_columns=None, bar_rounded=True, key=None):
    """
    Create a clickable table component with advanced visualization options.
    
    Parameters:
    -----------
    df : pandas.DataFrame
        The dataframe to display in the table
    styling_function : function, optional
        Function to apply pandas styling to the dataframe
    data_bar_columns : list of dict, optional
        List of data bar chart configurations, each with col_idx, min, max, and optional recommended_idx
        Example: [{'col_idx': 1, 'min': -100, 'max': 100, 'recommended_idx': 2}, 
                 {'col_idx': 3, 'min': 0, 'max': 50}]
        The 'recommended_idx' is the column index containing the recommended value to be displayed as a marker
    david_hum_columns : list of dict, optional
        List of david hum chart configurations
        Example: [{'col_idx': 3, 'min': 0, 'max': 100, 'exception_col_color': "yellow"}, 
                 {'col_idx': 4, 'min': 0, 'max': 100, 'exception_col_color': "lightblue"}]
    range_chart : list of dict, optional
        List of range chart configurations
    fixed_scale_range_chart : list of dict, optional
        List of fixed-scale range chart configurations. Each chart uses a fixed min/max scale
        across all rows with auto-generated tick marks and displays 3 dots per row.
        Example: [{
            'col_idx': 10,              # Column index where chart will be rendered
            'min': -1.5,                 # Fixed minimum value for entire table
            'max': 1.5,                  # Fixed maximum value for entire table
            'dot1_idx': 5,               # Column index for first dot
            'dot2_idx': 6,               # Column index for second dot
            'dot3_idx': 7,               # Column index for third dot
            'dot1_color': '#FF0000',     # Color for first dot (optional, default: '#9CA3AF')
            'dot2_color': '#00FF00',     # Color for second dot (optional, default: '#9CA3AF')
            'dot3_color': '#0000FF',     # Color for third dot (optional, default: '#9CA3AF')
            'line_color': '#D1D5DB',     # Color for the grey line (optional, default: '#D1D5DB')
            'line_height': 2,            # Height of line in pixels (optional, default: 2)
            'tick_marks': True           # Show tick marks (optional, default: True)
        }]
    idx_col_name : str, optional
        Name to display for the index column
    column_width : list of str, optional
        List of column width values (e.g. ['100px', '150px', ...])
    max_height : str, optional
        Maximum height of the table container (e.g. '800px')
    hidden_column_class : str, optional
        CSS class name to add to columns that should be hidden via CSS
        Default is "hide-column" which is defined in app.css
    hidden_columns : list of int, optional
        List of column indices to add the hidden class to (e.g. [5, 6, 7])
        Note: These columns will be hidden using CSS display:none
    bar_rounded : bool, optional
        Whether to use rounded edges for all bars (data bars, David Hum charts, and range charts)
        Default is True (rounded edges). Set to False for square edges.
    key : str, optional
        Key for the component instance
        
    Returns:
    --------
    dict
        Component return value containing clicked cell information
    """
    if df is None:
        st.error("DataFrame is required for clickable_table")
        return None
        
    # Configure the table styling
    if styling_function is not None:
        try:
            styled_df = styling_function(df)
            # Generate HTML from styled dataframe
            html = styled_df.to_html()
        except Exception as e:
            st.warning(f"Styling function failed: {e}. Using unstyled table.")
            html = df.to_html()
    else:
        # Generate HTML from unstyled dataframe
        html = df.to_html()
    
    # Build the configuration object
    config = {
        'data_bar_chart_columns': data_bar_columns or [],
        'david_hum_columns': david_hum_columns or [],
        'idx_col_name': idx_col_name or df.index.name or "",
        'column_width': column_width or [],
        'range_chart': range_chart or [],
        'fixed_scale_range_chart': fixed_scale_range_chart or [],
        'hidden_column_class': hidden_column_class,
        'hidden_columns': hidden_columns or [],
        'bar_rounded': bar_rounded
    }
    
    # Call the component function
    component_value = _component_func(
        html=html, 
        key=key, 
        config=config, 
        max_height=max_height, 
        default=None
    )
    
    return component_value

# Example/test code - will only run in development mode
if not _RELEASE:
    st.set_page_config(layout="wide")
    st.subheader("Test Clickable Table")

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
    
    # Debug: Print data types to verify
    st.write("### DataFrame Data Types:")
    st.write(df.dtypes)
    
    df = df.set_index("Epoch")
    df.index.name = None
    
    # Example configuration for multiple columns of each type
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
        
    # Show the regular dataframe for comparison
    st.write("### Regular DataFrame (for comparison)")
    # Commented out to avoid Arrow conversion issues during development
    # st.dataframe(style_dataframe(df))