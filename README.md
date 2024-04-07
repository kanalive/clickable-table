# Clickable Table Component for Streamlit

## A Word from the Karina

As an enthusiast and advocate for Python and Streamlit, I've always envisioned a future where dataframes and data editors are not just static entities but interactive canvases that respond to our touch. In the realm of data and analytics, the power to drill down into specifics with a simple click, influencing filters and altering visualizations, is not just a convenience—it's a necessity.

While the wonderful team at Streamlit is paving the way for such interactive features, some of us need them right now. And that's precisely why I created this custom component. Until Streamlit rolls out the official interactive tables, let's come together to use, improve, and maintain this component. It's a tribute to the vibrant community that always finds a way to make things work!

## About This Component

The Clickable Table component for Streamlit bridges the gap between static tables and interactive data exploration. It enables users to click on any cell within a table, capture the cell's data, and use it to refine data filters or adjust chart graphs dynamically. This functionality is central to data analysis and dashboard creation.

## Get Started

### Installation

To bring interactive tables into your Streamlit applications, download the whl file from the dist folder, install the component using pip:

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


## Contributing
If you'd like to contribute to this component, please feel free to make a pull request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.