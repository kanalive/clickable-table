# Range Chart Text Display Feature

## Overview

The Range Chart component now supports displaying custom text when the current value falls below both the short-term and long-term low thresholds. This is useful for highlighting values that are outside the expected range.

## Configuration

Add the `low_text` parameter to your range chart configuration:

```python
range_chart = [
    {
        'col_idx': 13,  # Column index for the range chart
        'long_term_high_idx': 8,    # Column index for long term high values
        'long_term_low_idx': 9,     # Column index for long term low values
        'short_term_high_idx': 10,  # Column index for short term high values
        'short_term_low_idx': 11,   # Column index for short term low values
        'current_idx': 12,          # Column index for current values
        'long_term_color': 'blue',  # Color for long term dots
        'short_term_color': 'green', # Color for short term dots
        'current_color': 'black',   # Color for current value dot
        'low_text': 'Below Range'   # Text to display when current < both thresholds
    }
]
```

## How It Works

The text will be displayed when:
```python
current < short_term_low AND current < long_term_low
```

## Example Usage

```python
import streamlit as st
from clickable_table import clickable_table
import pandas as pd

# Sample data
data = {
    'Metric': ['Revenue', 'Growth', 'Score'],
    'Long Term High': [1000, 50, 100],
    'Long Term Low': [100, 10, 20],
    'Short Term High': [800, 40, 80],
    'Short Term Low': [200, 15, 30],
    'Current': [150, 8, 15],
    'Range Chart': ["", "", ""]
}

df = pd.DataFrame(data)

# Range chart with text display
range_chart = [
    {
        'col_idx': 5,
        'long_term_high_idx': 1,
        'long_term_low_idx': 2,
        'short_term_high_idx': 3,
        'short_term_low_idx': 4,
        'current_idx': 5,
        'long_term_color': 'blue',
        'short_term_color': 'green',
        'current_color': 'red',
        'low_text': '⚠️ Below Range'
    }
]

# Create the clickable table
clickable_table(
    df=df,
    range_chart=range_chart,
    key="example"
)
```

## Styling

The text is styled with CSS classes:
- `.range-chart-text`: Styles for the text overlay
- `.range-chart-cell`: Ensures proper positioning for the text

You can customize the appearance by modifying the CSS in `src/app.css`.

## Testing

Run the test script to see the functionality in action:

```bash
cd clickable_table/frontend
npm start
```

Then run the Python test:
```bash
streamlit run test_range_chart.py
```

## Notes

- The text is positioned below the range chart dots
- The text only appears when the condition is met
- The feature is backward compatible - existing configurations without `low_text` will work as before
