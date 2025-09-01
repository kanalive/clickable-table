# Installation Guide for Clickable Table

## Option 1: Install from Local Package (Recommended for Testing)

If you have the package files locally:

```bash
# Install the wheel file
pip install dist/clickable_table-0.0.7.7-py3-none-any.whl

# Or install the source distribution
pip install dist/clickable_table-0.0.7.7.tar.gz
```

## Option 2: Install from PyPI (When Published)

```bash
pip install clickable-table
```

## Option 3: Install in Development Mode

For development and testing:

```bash
# Clone the repository
git clone <repository-url>
cd clickable-table

# Install in development mode
pip install -e .
```

## Verification

After installation, you can verify it works:

```python
import streamlit as st
from clickable_table import clickable_table

st.write("Clickable Table component imported successfully!")
```

## Requirements

- Python >= 3.7
- Streamlit >= 0.63
- pandas

## Troubleshooting

### Import Errors
If you get import errors, make sure:
1. The package is installed in the correct Python environment
2. You're using the right Python interpreter
3. The package was built correctly

### Build Issues
If you encounter build issues:
1. Make sure you have `wheel` installed: `pip install wheel`
2. Check that the React component is built: `npm run build` in the frontend directory
3. Verify all dependencies are installed

### Runtime Issues
If the component doesn't render:
1. Check the browser console for JavaScript errors
2. Verify the built React component is included in the package
3. Make sure `_RELEASE = True` in `__init__.py` for production use

## Development Setup

For local development:

1. Set `_RELEASE = False` in `__init__.py`
2. Run `npm start` in the `frontend` directory
3. The component will use localhost:3000 for development

## Package Contents

The package includes:
- Python module (`clickable_table`)
- Built React component (`frontend/build/`)
- CSS styles and JavaScript bundles
- Example usage (`example.py`)
- Comprehensive documentation
