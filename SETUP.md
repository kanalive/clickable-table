# Local Development Environment Setup

This guide will help you set up your local development environment for the Clickable Table Streamlit custom component.

## Prerequisites

1. **Python 3.7+** ✅ (You have Python 3.14.2)
2. **Node.js 14+ and npm** ❌ (Need to install)
3. **Streamlit** (Will install in steps below)

## Step 1: Install Node.js and npm

Node.js is required to build and run the React frontend component.

### Windows Installation:

1. Download Node.js from: https://nodejs.org/
   - Choose the LTS (Long Term Support) version
   - Download the Windows Installer (.msi)

2. Run the installer and follow the setup wizard
   - Make sure to check "Add to PATH" during installation

3. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

## Step 2: Install Python Dependencies

Install Streamlit and other Python dependencies:

```powershell
pip install streamlit pandas
```

Or if you prefer to install from requirements (if available):
```powershell
pip install -r requirements.txt
```

## Step 3: Install Frontend Dependencies

Navigate to the frontend directory and install Node.js dependencies:

```powershell
cd clickable_table\frontend
npm install
```

This will install:
- React and React DOM
- TypeScript
- react-scripts (Create React App)
- streamlit-component-lib

## Step 4: Install Package in Development Mode

From the project root directory:

```powershell
cd ..\..  # Return to project root
pip install -e .
```

The `-e` flag installs the package in "editable" mode, so changes to Python code are immediately available.

## Step 5: Verify Development Mode is Enabled

The `_RELEASE` flag in `clickable_table/__init__.py` should be set to `False` for development:

```python
_RELEASE = False  # ✅ Already set for development
```

When `_RELEASE = False`, the component will connect to `http://localhost:3001` for the React development server.

## Step 6: Start the Development Server

### Terminal 1: Start React Development Server

```powershell
cd clickable_table\frontend
npm start
```

This will:
- Start the React development server (usually on port 3000)
- Open your browser automatically
- Watch for file changes and hot-reload

**Note:** The component is configured to use port 3001. If your React app starts on port 3000, you may need to:
- Set the PORT environment variable: `$env:PORT=3001; npm start`
- Or update the port in `clickable_table/__init__.py` to match your React dev server port

### Terminal 2: Run Streamlit App

```powershell
# From project root
streamlit run clickable_table/example.py
```

Or if you want to test with the built-in example in `__init__.py`:

```powershell
streamlit run clickable_table/__init__.py
```

## Development Workflow

1. **Frontend Changes (React/TypeScript):**
   - Edit files in `clickable_table/frontend/src/`
   - Changes will hot-reload automatically in the browser
   - The Streamlit app will automatically use the updated component

2. **Backend Changes (Python):**
   - Edit files in `clickable_table/`
   - Restart the Streamlit app to see changes

3. **Testing:**
   - The component includes test code in `__init__.py` that runs when `_RELEASE = False`
   - You can also use `clickable_table/example.py` for testing

## Troubleshooting

### Port Conflicts

If port 3000 or 3001 is already in use:

**For React dev server:**
```powershell
# Set custom port
$env:PORT=3002
npm start
```

Then update `clickable_table/__init__.py`:
```python
url="http://localhost:3002"
```

**For Streamlit:**
```powershell
streamlit run clickable_table/example.py --server.port 8502
```

### Module Not Found Errors

If you get import errors:
```powershell
# Reinstall in development mode
pip install -e . --force-reinstall
```

### React Build Issues

If npm install fails:
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Component Not Loading

1. Verify `_RELEASE = False` in `__init__.py`
2. Check that React dev server is running on the correct port
3. Check browser console for errors
4. Verify the URL in `__init__.py` matches your React dev server URL

## Building for Production

When ready to build for production:

1. Set `_RELEASE = True` in `clickable_table/__init__.py`
2. Build the React component:
   ```powershell
   cd clickable_table\frontend
   npm run build
   ```
3. The built files will be in `clickable_table/frontend/build/`
4. Package the component:
   ```powershell
   python setup.py sdist bdist_wheel
   ```

## Quick Start Commands Summary

```powershell
# 1. Install Node.js dependencies
cd clickable_table\frontend
npm install

# 2. Install Python package in dev mode
cd ..\..
pip install -e .

# 3. Start React dev server (Terminal 1)
cd clickable_table\frontend
npm start

# 4. Run Streamlit app (Terminal 2)
cd ..\..
streamlit run clickable_table/example.py
```

## Next Steps

Once everything is set up:
- Start making changes to the React component in `clickable_table/frontend/src/ClickableTable.tsx`
- Test your changes in the Streamlit app
- Check the browser console and Streamlit terminal for any errors

Happy coding! 🚀

