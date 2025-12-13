# Benzy Duty Free Shop - Retail Management System

A modern, full-stack Point of Sale (POS) and Retail Management System built with **FastAPI** (Python) backend and **React** frontend with a classic, professional navy blue theme.

## 🚀 Features

### ✅ Current Implementation

- **User Authentication & Authorization**: Role-based access control (Admin, Manager, Cashier)
- **Modern Classic UI**: Professional navy blue gradient theme with organized dropdown navigation
- **Point of Sale (POS)**: Fast product search, real-time cart management, checkout system
- **Product Management**: Complete CRUD operations for products with stock tracking
- **Stock Management**: Track inventory levels and stock adjustments
- **Supplier Management**: Track suppliers and purchase orders
- **Customer Management**: Customer database with purchase history
- **Sales Tracking**: Complete transaction history with invoice generation
- **Tax Management**: Built-in GST calculation per product
- **Multi-Store Support**: Manage multiple store locations and inventory transfers
- **Activity Logs**: Track user actions for audit trail
- **Analytics Dashboard**: Real-time insights with revenue, sales, and inventory metrics
- **Reports**: Comprehensive reporting system
- **Settings Management**: Configurable system settings
- **Backup & Restore**: Database backup and restore functionality
- **Database**: SQLite for easy setup and portability

### 🎨 UI Features

- **Organized Navigation**: Categorized dropdown menus (Sales, Inventory, Reports, Management)
- **Responsive Design**: Works seamlessly on different screen sizes
- **Professional Theme**: Navy blue gradient with smooth transitions and animations
- **Role-Based UI**: Dynamic menu display based on user permissions

---

## 📋 Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.13)
- **Database**: SQLite 3 (easy setup, no separate server needed)
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: Bcrypt
- **Environment**: Python Virtual Environment (.venv)

### Frontend
- **UI Library**: React 18.2
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Build Tool**: React Scripts 5.0
- **Styling**: Custom CSS with modern gradients and animations

---

## 🏗️ Project Structure

```
RAR/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/         # API routes
│   │   │   └── endpoints/  # Individual route modules (auth, products, sales, etc.)
│   │   ├── core/           # Config, security, utilities
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── schemas/        # Pydantic validation schemas
│   │   └── database/       # Database connection & session
│   ├── create_admin.py     # Script to create admin user
│   ├── .env                # Environment variables
│   └── requirements.txt    # Python dependencies
├── frontend/                # React Frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # Reusable React components (Navbar, etc.)
│   │   ├── pages/          # Application pages (POS, Dashboard, Products, etc.)
│   │   ├── redux/          # State management
│   │   │   ├── slices/    # Redux Toolkit slices (auth, pos)
│   │   │   └── store.js
│   │   ├── styles/         # CSS files with navy theme
│   │   ├── utils/          # Helper functions (API client)
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── benzy_retail.db         # SQLite database file (auto-created)
├── .env                    # Environment variables
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

Make sure you have the following installed:

- **Python 3.11+**: [Download](https://www.python.org/downloads/)
- **Node.js 18+**: [Download](https://nodejs.org/)

---

### Step 1: Clone the Repository

```powershell
git clone <repository-url>
cd RAR
```

---

### Step 2: Setup Backend

#### Create Python Virtual Environment

```powershell
# Navigate to project root
cd "C:\Users\rashe\OneDrive\Documents\modeling solution\RAR"

# Create virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1
```

#### Install Backend Dependencies

```powershell
cd backend
pip install -r requirements.txt
```

#### Setup Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=sqlite:///./benzy_retail.db

# Security
SECRET_KEY=your-secret-key-min-32-characters-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Environment
ENVIRONMENT=development
PROJECT_NAME=Benzy Retail Management System
VERSION=1.0.0
```

#### Create Admin User

```powershell
# From backend directory
python create_admin.py
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

#### Start Backend Server

```powershell
# Make sure you're in the backend directory with venv activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Verify Backend:**
- API Docs: http://localhost:8000/api/docs
- Health Check: http://localhost:8000/health

---

### Step 3: Setup Frontend

Open a new terminal window:

```powershell
cd frontend
npm install
```

#### Start Frontend Development Server

```powershell
npm start
```

The application will open at http://localhost:3000

---

## 📱 Using the System

### 1. **Login**
- Open the application at http://localhost:3000
- Use credentials: `admin` / `admin123`
- You'll be redirected to the Dashboard

### 2. **Navigation**
The navbar is organized into categories with dropdown menus:

- **Dashboard**: Overview of sales, revenue, and inventory
- **POS**: Point of sale interface for processing transactions
- **Sales** ↓
  - Customers: Manage customer database
- **Inventory** ↓
  - Products: Manage product catalog
  - Stock: Track and adjust inventory levels
  - Purchases: Record supplier purchases
  - Suppliers: Manage supplier information
- **Reports** ↓
  - Analytics: View business insights and charts
  - Reports: Generate detailed reports
- **Management** ↓ *(Admin/Manager only)*
  - Users: Manage system users
  - Stores: Multi-store management
  - Settings: System configuration

### 3. **POS (Point of Sale)**
- Navigate to the POS page
- Search for products by name or barcode
- Products are added to the cart
- Adjust quantities as needed
- Click **"Complete Sale"** to finalize the transaction
- An invoice number will be generated

### 4. **Product Management**
- Navigate to **Inventory → Products**
- Add new products with barcode, pricing, stock, and GST information
- Edit or delete existing products
- Track current stock levels

### 5. **Analytics**
- View real-time metrics on the Dashboard
- Navigate to **Reports → Analytics** for detailed insights
- Track revenue, sales count, inventory value, and stock status

---

## 🗄️ Database Schema

### Key Tables

- **users**: System users with role-based access (Admin, Manager, Cashier)
- **products**: Product catalog with barcode, pricing, stock, and GST
- **suppliers**: Supplier information and contact details
- **customers**: Customer database for CRM
- **sales**: Transaction records with invoice numbers
- **sale_items**: Line items for each sale
- **purchases**: Purchase orders from suppliers
- **purchase_items**: Line items for purchases
- **stores**: Multi-store management
- **inventory_transfers**: Track inventory movement between stores
- **stock_adjustments**: Manual stock level adjustments
- **activity_logs**: Audit trail of user actions
- **backups**: Database backup records

### Relationships

- `Sales` → `SaleItems` → `Products` (One-to-Many)
- `Products` → `Supplier` (Many-to-One)
- `Sales` → `Customer` (Many-to-One)
- `Sales` → `User` (Many-to-One, tracks which user made the sale)
- `Stores` → `InventoryTransfers` (One-to-Many)
- `Users` → `ActivityLogs` (One-to-Many)

### Database Type

The system uses **SQLite** which provides:
- Zero configuration - no separate database server needed
- Single file database - easy backup and portability
- Perfect for small to medium retail operations
- Can be upgraded to PostgreSQL for larger deployments

---

## 🔧 Development Commands

### Backend

```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Start backend server
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Create admin user
python create_admin.py

# Install new dependencies
pip install <package-name>
pip freeze > requirements.txt
```

### Frontend

```powershell
# Install dependencies
cd frontend
npm install

# Run development server
npm start

# Build production version
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

### Database

```powershell
# Backup database
copy benzy_retail.db benzy_retail_backup.db

# View database (using SQLite browser or command line)
sqlite3 benzy_retail.db
```

---

## 🛠️ API Endpoints

Base URL: `http://localhost:8000/api/v1`

### Authentication
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user info

### Products
- `GET /products` - List all products (with search & filters)
- `GET /products/{id}` - Get product by ID
- `GET /products/barcode/{barcode}` - Get product by barcode (for POS)
- `POST /products` - Create new product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Soft delete product

### Sales
- `POST /sales` - Create a new sale
- `GET /sales` - List all sales (with filters)
- `GET /sales/{id}` - Get sale details
- `GET /sales/invoice/{invoice_number}` - Get sale by invoice

### Customers
- `GET /customers` - List customers
- `POST /customers` - Add new customer
- `GET /customers/{id}` - Get customer details
- `PUT /customers/{id}` - Update customer
- `DELETE /customers/{id}` - Delete customer

### Suppliers
- `GET /suppliers` - List suppliers
- `POST /suppliers` - Add new supplier
- `GET /suppliers/{id}` - Get supplier details
- `PUT /suppliers/{id}` - Update supplier
- `DELETE /suppliers/{id}` - Delete supplier

### Purchases
- `GET /purchases` - List all purchases
- `POST /purchases` - Create new purchase order
- `GET /purchases/{id}` - Get purchase details

### Stores
- `GET /stores` - List all stores
- `POST /stores` - Create new store
- `GET /stores/{id}` - Get store details
- `PUT /stores/{id}` - Update store

### Inventory Transfers
- `GET /inventory-transfers` - List transfers between stores
- `POST /inventory-transfers` - Create new transfer

### Users (Admin Only)
- `GET /users` - List all users
- `POST /users` - Create new user
- `GET /users/{id}` - Get user details
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

### Activity Logs
- `GET /activity-logs` - View user activity audit trail

### Analytics
- `GET /analytics/dashboard` - Get dashboard metrics
- `GET /analytics/sales-trends` - Sales trend data

### Backups
- `POST /backups` - Create database backup
- `GET /backups` - List all backups
- `POST /backups/restore/{id}` - Restore from backup

**Full API Documentation:** http://localhost:8000/api/docs

---

## 🧪 Testing the System

### 1. Test Authentication
```powershell
curl -X POST "http://localhost:8000/api/v1/auth/login" `
  -H "Content-Type: application/x-www-form-urlencoded" `
  -d "username=admin&password=admin123"
```

### 2. Add a Test Product
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$body = @{
  barcode = "123456789"
  name = "Test Product"
  category = "Electronics"
  cost_price = 100
  selling_price = 150
  current_stock = 10
  gst_rate = 18.0
  hsn_code = "1234"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/products" `
  -Method Post `
  -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } `
  -Body $body
```

### 3. Test POS Flow
1. Login to the app with `admin` / `admin123`
2. Navigate to POS page
3. Search for product by name or barcode
4. Verify product appears in cart with correct pricing
5. Click "Complete Sale"
6. Check the invoice number generated

### 4. View API Documentation
Open http://localhost:8000/api/docs for interactive Swagger UI where you can:
- Test all API endpoints
- View request/response schemas
- Generate sample requests

---

## 📊 Features Overview

### User Management
- Role-based access control (Admin, Manager, Cashier)
- Secure JWT authentication
- Activity logging for audit trail
- User permissions and restrictions

### Point of Sale
- Fast product search and cart management
- Real-time price calculation with GST
- Invoice generation
- Customer selection
- Payment processing

### Inventory Management
- Product catalog with barcoding
- Stock level tracking
- Low-stock alerts
- Stock adjustments
- Purchase order management

### Multi-Store Support
- Manage multiple store locations
- Transfer inventory between stores
- Per-store reporting
- Centralized management

### Reports & Analytics
- Real-time dashboard with key metrics
- Sales trends and insights
- Revenue tracking
- Inventory valuation
- Custom date range reports

### Security Features
- Password hashing with bcrypt
- JWT token-based authentication
- Role-based authorization
- Activity logging
- Secure API endpoints

---

## 🎨 UI/UX Features

- **Classic Professional Theme**: Navy blue gradient design
- **Organized Navigation**: Dropdown menus categorized by function
- **Responsive Layout**: Works on desktop and tablet devices
- **Smooth Animations**: Professional transitions and hover effects
- **Role-Based Display**: Dynamic menu based on user permissions
- **User-Friendly**: Intuitive interface with clear visual hierarchy

---

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Check if Python is activated
.\.venv\Scripts\Activate.ps1

# Verify dependencies are installed
pip list

# Check for port conflicts
netstat -an | Select-String ":8000"

# Restart backend
cd backend
uvicorn app.main:app --reload
```

### Frontend errors
```powershell
# Clear node_modules and reinstall
cd frontend
Remove-Item -Recurse -Force node_modules
npm install

# Clear cache
npm cache clean --force
Remove-Item -Recurse -Force node_modules/.cache

# Restart dev server
npm start
```

### Database issues
```powershell
# Check if database file exists
Test-Path benzy_retail.db

# Recreate admin user
cd backend
python create_admin.py

# Backup and recreate database
copy benzy_retail.db benzy_retail_backup.db
Remove-Item benzy_retail.db
# Restart backend to recreate tables
```

### Login issues
- Verify admin user was created: Check backend logs
- Clear browser cache and cookies
- Check that backend is running on port 8000
- Verify frontend is connecting to correct API URL

### Port conflicts
```powershell
# Check what's using port 8000 (backend)
netstat -ano | findstr :8000

# Check what's using port 3000 (frontend)
netstat -ano | findstr :3000

# Kill process if needed
Stop-Process -Id <PID> -Force
```

---

## 📄 License

MIT License - Free for personal and commercial use.

---

## 👨‍💻 Developer

Built by **Rasheed** for **Benzy Duty Free Shop**

For questions or support, contact the development team.

---

## 🙏 Acknowledgments

- FastAPI framework by Sebastián Ramírez
- React & Redux by Facebook/Meta
- Electron by GitHub
- PostgreSQL community

---

**Happy Selling! 🎉**
