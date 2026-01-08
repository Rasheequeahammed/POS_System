# 🚀 Benzy POS - Fresh Installation Guide

Complete setup guide for installing and running the Benzy POS application on a new laptop.

---

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Step 1: Install Required Software](#step-1-install-required-software)
- [Step 2: Clone the Repository](#step-2-clone-the-repository)
- [Step 3: Backend Setup](#step-3-backend-setup)
- [Step 4: Frontend Setup](#step-4-frontend-setup)
- [Step 5: Run the Application](#step-5-run-the-application)
- [Step 6: Initial Configuration](#step-6-initial-configuration)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

✅ **Already Installed:**
- VS Code
- Python (version 3.8 or higher)

⚠️ **Need to Install:**
- Git
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)

---

## Step 1: Install Required Software

### 1.1 Install Git
1. Download Git from: https://git-scm.com/download/win
2. Run the installer with default settings
3. Verify installation:
   ```powershell
   git --version
   ```

### 1.2 Install Node.js
1. Download Node.js LTS from: https://nodejs.org/
2. Run the installer (ensure "npm package manager" is selected)
3. Restart VS Code terminal
4. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

### 1.3 Install PostgreSQL
1. Download PostgreSQL from: https://www.postgresql.org/download/windows/
2. Run the installer:
   - **Important:** Remember the password you set for the `postgres` user
   - Default port: `5432` (keep this)
   - Install pgAdmin 4 (included in installer)
3. Verify installation:
   ```powershell
   psql --version
   ```

---

## Step 2: Clone the Repository

1. Open VS Code
2. Open a new terminal (`Ctrl + `` ` ``)
3. Navigate to your desired folder:
   ```powershell
   cd "C:\Users\YourUsername\Documents"
   ```
4. Clone the repository:
   ```powershell
   git clone https://github.com/Rasheequeahammed/POS_System.git
   cd POS_System
   ```
5. Open the folder in VS Code:
   ```powershell
   code .
   ```

---

## Step 3: Backend Setup

### 3.1 Verify Python Installation
```powershell
python --version
```
**Expected:** Python 3.8 or higher

### 3.2 Create Python Virtual Environment
Navigate to the backend folder and create a virtual environment:
```powershell
cd backend
python -m venv venv
```

### 3.3 Activate Virtual Environment

**On Windows PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
```

**If you get an execution policy error, run:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
Then try activating again.

**On Windows Command Prompt:**
```cmd
venv\Scripts\activate.bat
```

**Verify activation:** You should see `(venv)` at the beginning of your terminal prompt.

### 3.4 Install Python Dependencies
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

**Expected packages installed:**
- fastapi
- uvicorn
- sqlalchemy
- psycopg2-binary
- python-jose
- passlib
- python-multipart
- pydantic
- python-dotenv

### 3.5 Create PostgreSQL Database

#### Option A: Using pgAdmin 4 (GUI)
1. Open pgAdmin 4
2. Connect to PostgreSQL server (use the password you set during installation)
3. Right-click on "Databases" → "Create" → "Database"
4. Database name: `pos_db`
5. Click "Save"

#### Option B: Using Command Line
```powershell
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE pos_db;
\q
```

### 3.6 Configure Environment Variables

Create a `.env` file in the `backend` folder:

```powershell
# In backend folder
New-Item .env
```

Open `.env` and add the following configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password_here@localhost:5432/pos_db

# Security
SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Origins (for development)
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
```

**Important:** Replace `your_password_here` with your actual PostgreSQL password!

### 3.7 Initialize Database Schema

Run the database initialization script:

```powershell
# Make sure you're in the backend folder and venv is activated
python -c "from app.database.session import engine; from app.models import *; from app.database.base import Base; Base.metadata.create_all(bind=engine)"
```

Or run the SQL initialization script:
```powershell
psql -U postgres -d pos_db -f database/init.sql
```

### 3.8 Create Admin User

```powershell
python create_admin.py
```

**Default admin credentials created:**
- **Username:** `admin`
- **Password:** `admin123`

**⚠️ Important:** Change this password after first login in production!

### 3.9 (Optional) Add Sample Products

```powershell
psql -U postgres -d pos_db -f add_sample_products.sql
```

---

## Step 4: Frontend Setup

### 4.1 Navigate to Frontend Folder

Open a **new terminal** (keep backend terminal open) and navigate:
```powershell
cd frontend
```

### 4.2 Install Node.js Dependencies

```powershell
npm install
```

**This will install:**
- React
- Redux Toolkit
- React Router
- Axios
- Chart.js
- Material-UI components
- And other dependencies

**Expected duration:** 2-5 minutes depending on internet speed

### 4.3 Verify Installation

Check if `node_modules` folder was created:
```powershell
ls node_modules
```

---

## Step 5: Run the Application

### 5.1 Start Backend Server

**Terminal 1 - Backend:**
```powershell
# Navigate to backend folder
cd backend

# Activate virtual environment (if not already active)
.\venv\Scripts\Activate.ps1

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Backend API:** http://localhost:8000
**API Documentation:** http://localhost:8000/docs

### 5.2 Start Frontend Development Server

**Terminal 2 - Frontend:**
```powershell
# Navigate to frontend folder
cd frontend

# Start React development server
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

**Frontend Application:** http://localhost:3000

**Note:** If port 3000 is busy, it will ask to use port 3001. Type `Y` and press Enter.

### 5.3 Verify Application is Running

1. Open browser and go to: http://localhost:3000
2. You should see the Benzy POS login page
3. Login with default credentials:
   - **Username:** `admin`
   - **Password:** `admin123`
4. After successful login, you should see the Dashboard

---

## Step 6: Initial Configuration

### 6.1 Change Admin Password

1. Login to the application
2. Navigate to **User Management**
3. Click edit on the `admin` user
4. Change password to something secure
5. Save changes

### 6.2 Configure Store Information

1. Navigate to **Settings** → **Store Information**
2. Fill in your store details:
   - Store Name
   - Owner Name
   - Address
   - Phone Number
   - Email
   - GST Number
3. Click **Save Changes**

### 6.3 Create Users (Optional)

1. Navigate to **User Management**
2. Click **Add User**
3. Create users with different roles:
   - **Admin:** Full access to all features
   - **Manager:** Access to most features except user management
   - **Cashier:** Limited to POS and basic operations

### 6.4 Add Products

1. Navigate to **Products** page
2. Click **Add Product**
3. Fill in product details:
   - Barcode
   - Name
   - Category
   - Cost Price
   - Selling Price
   - Stock Quantity
   - Minimum Stock Level
   - HSN Code
   - GST %
4. Click **Save**

---

## Troubleshooting

### Backend Issues

#### ❌ Problem: `ModuleNotFoundError: No module named 'fastapi'`
**Solution:**
```powershell
# Ensure virtual environment is activated
.\venv\Scripts\Activate.ps1

# Reinstall dependencies
pip install -r requirements.txt
```

#### ❌ Problem: Database connection error
**Solution:**
1. Verify PostgreSQL is running:
   ```powershell
   # Check if PostgreSQL service is running
   Get-Service -Name postgresql*
   ```
2. Check `.env` file has correct database credentials
3. Verify database exists:
   ```powershell
   psql -U postgres -c "\l"
   ```

#### ❌ Problem: `psycopg2` installation error
**Solution:**
```powershell
pip install psycopg2-binary
```

#### ❌ Problem: Port 8000 already in use
**Solution:**
```powershell
# Use a different port
uvicorn app.main:app --reload --port 8001
```
Then update frontend API URL in `src/redux/store.js`

### Frontend Issues

#### ❌ Problem: `npm: command not found`
**Solution:**
1. Restart VS Code terminal after installing Node.js
2. Verify Node.js installation:
   ```powershell
   node --version
   ```

#### ❌ Problem: `npm install` fails
**Solution:**
```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install
```

#### ❌ Problem: React app shows blank page
**Solution:**
1. Check browser console for errors (F12)
2. Verify backend is running on http://localhost:8000
3. Check CORS settings in backend `.env` file
4. Clear browser cache and reload

#### ❌ Problem: API calls failing (Network Error)
**Solution:**
1. Verify backend server is running
2. Check API base URL in `frontend/src/redux/store.js`:
   ```javascript
   baseURL: 'http://localhost:8000',
   ```
3. Check browser console for CORS errors
4. Verify firewall is not blocking ports 8000/3000

### Database Issues

#### ❌ Problem: `role "postgres" does not exist`
**Solution:**
```powershell
# Create postgres role
psql -U postgres -c "CREATE USER postgres WITH SUPERUSER PASSWORD 'your_password';"
```

#### ❌ Problem: Tables not created
**Solution:**
```powershell
cd backend
python -c "from app.database.session import engine; from app.models import *; from app.database.base import Base; Base.metadata.create_all(bind=engine)"
```

#### ❌ Problem: Admin user not created
**Solution:**
```powershell
cd backend
python create_admin.py
```

---

## 🎯 Quick Start Checklist

- [ ] Git installed and verified
- [ ] Node.js installed and verified
- [ ] PostgreSQL installed and running
- [ ] Repository cloned
- [ ] Python virtual environment created and activated
- [ ] Python dependencies installed
- [ ] PostgreSQL database `pos_db` created
- [ ] `.env` file configured with correct credentials
- [ ] Database schema initialized
- [ ] Admin user created
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend server running on port 8000
- [ ] Frontend server running on port 3000
- [ ] Successfully logged in to application
- [ ] Admin password changed
- [ ] Store information configured

---

## 📞 Support

If you encounter issues not covered in this guide:

1. Check the console/terminal for error messages
2. Review the [TESTING_WORKFLOW.md](TESTING_WORKFLOW.md) for known issues
3. Check GitHub issues: https://github.com/Rasheequeahammed/POS_System/issues

---

## 🔄 Daily Development Workflow

After initial setup, to run the application daily:

### Quick Start Commands:

**Terminal 1 - Backend:**
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm start
```

**Access Application:** http://localhost:3000

---

## 📝 Notes

- Keep both terminal windows open while using the application
- Backend must be running for frontend to work
- Database must be running for backend to work
- First user created is always `admin/admin123`
- Sample products are optional (can add manually later)
- Default ports: Backend (8000), Frontend (3000/3001), PostgreSQL (5432)

---

**Installation Date:** January 8, 2026  
**Version:** 1.0  
**Last Updated:** January 8, 2026
