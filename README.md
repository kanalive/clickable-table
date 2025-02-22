# Clickable Table Component for Streamlit

## A Word from the Karina

As an enthusiast and advocate for Python and Streamlit, I've always envisioned a future where dataframes and data editors are not just static entities but interactive canvases that respond to our touch. In the realm of data and analytics, the power to drill down into specifics with a simple click, influencing filters and altering visualizations, is not just a convenience—it's a necessity.

While the wonderful team at Streamlit is paving the way for such interactive features, some of us need them right now. And that's precisely why I created this custom component. Until Streamlit rolls out the official interactive tables, let's come together to use, improve, and maintain this component. It's a tribute to the vibrant community that always finds a way to make things work!

## About This Component

The Clickable Table component for Streamlit bridges the gap between static tables and interactive data exploration. It enables users to click on any cell within a table, capture the cell's data, and use it to refine data filters or adjust chart graphs dynamically. This functionality is central to data analysis and dashboard creation.

The Clickable Table component takes full advantage of pandas' powerful `Styler` object. Begin by styling your pandas DataFrame to your heart's content, using the myriad styling options available to you. Once you've crafted the visual representation of your data with colors, conditional formats, and more, the Clickable Table component seamlessly renders your `Styler` object as interactive HTML. With clickable functionality layered on top, each cell in your table becomes an interactive element, allowing users to engage with the data more intuitively.

## Screenshot
![Clickable Table Demo](images/Screenshot.png)

## Features

- **Interactive Cells**: Click on any cell to capture its data for use in filters or other visualizations
- **Multiple Data Bar Charts**: Display proportional bars for numeric data with customizable min/max values
- **David Hum Columns**: Named after my dear colleague David Hum, these special columns display percentage bars for numeric values while highlighting text values with custom background colors (a somewhat speechless requirement, but David is great, so I implemented it anyway!)
- **Range Charts**: Visualize data ranges with customizable dots representing values like high/low points
- **Hidden Calculation Columns**: Hide columns that are needed for calculations but not for display
- **Custom Column Widths**: Set specific widths for each column for better readability
- **Streamlit Theme Integration**: Automatically adapts to your Streamlit theme colors

## Get Started

### Installation

To bring interactive tables into your Streamlit applications, download the whl file from the dist folder, install the component using pip:

```bash
pip install clickable_table-0.0.7.5-py3-none-any.whl
```

## Usage
Here's a simple example of how to use the Clickable Table component in your Streamlit app:

```python
import streamlit as st
from clickable_table import clickable_table
import pandas as pd

st.subheader("Test Clickable Table")

# Sample data
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

# Component configurations
data_bar_columns = [
    {'col_idx': 1, 'min': -1000000, 'max': 2500000},  # C 1 column
    {'col_idx': 3, 'min': -2, 'max': 2}               # C 3 column
]

david_hum_columns = [
    {'col_idx': 4, 'min': 0, 'max': 100, 'exception_col_color': "yellow"}
]

range_chart = [
    {'col_idx': 10, 
     'long_term_high_idx': 5,
     'long_term_low_idx': 6,
     'short_term_high_idx': 7,
     'short_term_low_idx': 8,
     'current_idx': 9, 
     'long_term_color': 'blue', 
     'short_term_color': 'green', 
     'current_color': 'black'
    }
]

column_width = [
    '100px', '120px', '100px', '100px', '150px',
    '100px', '100px', '100px', '100px', '100px', '150px'
]

hidden_columns = [6, 7, 8, 9] 

# Create the clickable table
return_value = clickable_table(
    df=df,
    styling_function=style_dataframe,
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
```

## Advanced Visualization Options

### Data Bar Charts
Create proportional bar charts inside cells with negative and positive values:

```python
data_bar_columns = [
    {'col_idx': 1, 'min': -1000000, 'max': 2500000},  # Column 1
    {'col_idx': 3, 'min': -2, 'max': 2}               # Column 3
]
```
![Data Bar Charts](images/data_bar_chart.png)


### David Hum Columns
Special columns display percentage bars for numeric values while highlighting text values with custom background colors:

```python
david_hum_columns = [
    {'col_idx': 4, 'min': 0, 'max': 100, 'exception_col_color': "yellow"},
    {'col_idx': 5, 'min': 0, 'max': 100, 'exception_col_color': "lightblue"}
]
```
![David Hum Columns](images/david_hum_column_chart.png)

### Range Charts
Visualize ranges with dots representing different values:

```python
range_chart = [
    {'col_idx': 10,                    # Column to display the chart
     'long_term_high_idx': 5,          # Column index with long term high values
     'long_term_low_idx': 6,           # Column index with long term low values
     'short_term_high_idx': 7,         # Column index with short term high values
     'short_term_low_idx': 8,          # Column index with short term low values
     'current_idx': 9,                 # Column index with current values
     'long_term_color': 'blue',        # Color for long term dots
     'short_term_color': 'green',      # Color for short term dots
     'current_color': 'black'          # Color for current value dot
    }
]
```
![Range Charts](images/range_chart.png)

### Hiding Calculation Columns
Some visualizations (like range charts) need data columns that you might not want to display. You can hide these columns while still using their values for calculations:

```python
# Specify which columns to hide (by index)
hidden_columns = [6, 7, 8, 9]  # Calculation columns used by the range chart

# The columns will be hidden but still available for calculations
clickable_table(
    # ... other parameters ...
    
)
```

## Contributing
If you'd like to contribute to this component, please feel free to make a pull request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.