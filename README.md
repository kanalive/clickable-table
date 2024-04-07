# Clickable Table Component for Streamlit

This custom component for Streamlit allows users to create interactive tables where each cell is clickable. Users can specify the header and index column colors, and the component will return details of the clicked cell back to the Streamlit app.

## Installation

To install the component, download the whl file from /disc folder:

```bash
pip install clickable_table-0.0.1-py3-none-any.whl
```
##  Usage
Here's a simple example of how to use the Clickable Table component in your Streamlit app:

```bash
import streamlit as st
from streamlit_clickable_table import clickable_table

# Sample data for the table
data = {
    'Epoch': [1, 2, 3, 4, 5, 6, 7, 8],
    '2 Fut': [0.081, -1.164, -1.635, -1.515, -1.460, -1.306, -1.136, -1.222],
    # Add the rest of your columns here
}

# Convert your data into a pandas DataFrame
df = pd.DataFrame(data)

# Call the clickable_table function to render your interactive table
clicked_value = clickable_table(df)

# Display the return value from the table click
if clicked_value is not None:
    st.write(f"You clicked on cell: {clicked_value}")
```

## Component Options
* header_color: A string representing the CSS color for the table headers.
* index_color: A string representing the CSS color for the index column.

## Contributing
If you'd like to contribute to this component, please feel free to make a pull request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.