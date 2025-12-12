# Benzy Duty Free Shop - Retail Management System

A modern, full-stack Point of Sale (POS) and Retail Management System built with **FastAPI** (Python) backend and **Electron + React** frontend.

## 🚀 Features (MVP - Phase 1)

### ✅ Current Implementation

- **User Authentication**: Role-based access control (Admin, Manager, Cashier)
- **Point of Sale (POS)**: Fast barcode scanning, real-time cart management, checkout system
- **Product Management**: Complete CRUD operations for products with stock tracking
- **Supplier Management**: Track suppliers and purchase orders
- **Customer Management**: Customer database with purchase history
- **Sales Tracking**: Complete transaction history with invoice generation
- **Tax Management**: Built-in GST calculation per product
- **Database**: PostgreSQL with proper relationships and transactions

### 🔮 Upcoming (Phase 2 & 3)

- Reports & Analytics Dashboard
- Low-stock alerts and automation
- Customer loyalty program
- SMS/WhatsApp marketing integration
- Printer integration for receipts
- Multi-store support

---

## 📋 Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL 15
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens)
- **Containerization**: Docker

### Frontend
- **Desktop Framework**: Electron 27
- **UI Library**: React 18
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios

---

## 🏗️ Project Structure

```
RAR/
├── backend/                 # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/         # API routes
│   │   │   └── endpoints/  # Individual route modules
│   │   ├── core/           # Config, security, utilities
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── schemas/        # Pydantic validation schemas
│   │   └── database/       # Database connection & session
│   ├── database/
│   │   └── init.sql        # Database initialization script
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                # Electron + React Frontend
│   ├── public/
│   │   ├── electron.js     # Electron main process
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Application pages
│   │   ├── redux/          # State management
│   │   │   ├── slices/    # Redux Toolkit slices
│   │   │   └── store.js
│   │   ├── styles/         # CSS files
│   │   ├── utils/          # Helper functions (API client)
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── docker-compose.yml       # Multi-container orchestration
├── .env.example            # Environment variables template
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites

Make sure you have the following installed:

- **Docker Desktop** (for Windows): [Download](https://www.docker.com/products/docker-desktop/)
- **Node.js 18+**: [Download](https://nodejs.org/)
- **Python 3.11+** (optional, for local backend development)

---

### Step 1: Clone the Repository

```powershell
cd "C:\Users\rashe\OneDrive\Documents\modeling solution\RAR"
```

---

### Step 2: Setup Environment Variables

Copy the example environment file and update with your settings:

```powershell
Copy-Item .env.example .env
```

Open `.env` and update the `SECRET_KEY`:

```env
SECRET_KEY=your-very-secret-key-change-this-in-production-min-32-chars
```

---

### Step 3: Start the Backend (Docker)

Start PostgreSQL and FastAPI backend using Docker Compose:

```powershell
docker-compose up -d
```

This will:
- Start PostgreSQL on `localhost:5432`
- Start FastAPI backend on `localhost:8000`
- Create all database tables automatically
- Insert a default admin user

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

**Verify Backend:**
- API Docs: http://localhost:8000/api/docs
- Health Check: http://localhost:8000/health

---

### Step 4: Setup Frontend

Navigate to the frontend directory:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm install
```

---

### Step 5: Run the Application

#### Option A: Run as Electron Desktop App (Recommended for Production)

```powershell
npm run electron-dev
```

This will:
- Start the React development server
- Launch the Electron window automatically
- Enable hot-reload for development

#### Option B: Run as Web App (For Development)

```powershell
npm start
```

Then open http://localhost:3000 in your browser.

---

## 📱 Using the System

### 1. **Login**
- Open the application
- Use credentials: `admin` / `admin123`

### 2. **POS (Point of Sale)**
- The main screen is the POS interface
- **Scan or type a product barcode** in the search field
- Products are added to the cart automatically
- Click **"Complete Sale"** to finalize the transaction
- An invoice number will be generated

### 3. **Add Products**
Currently, you need to add products via the API (use the Swagger UI at http://localhost:8000/api/docs):

**Example Product JSON:**
```json
{
  "barcode": "8901234567890",
  "name": "Sample Product",
  "category": "General",
  "cost_price": 100.00,
  "selling_price": 150.00,
  "current_stock": 50,
  "gst_rate": 18.0,
  "hsn_code": "1234",
  "is_active": 1
}
```

Or use the planned **CSV Import** feature (coming in Week 2-3).

---

## 🗄️ Database Schema

### Key Tables

- **users**: System users with role-based access
- **products**: Product catalog with pricing and stock
- **suppliers**: Supplier information
- **customers**: Customer database for CRM
- **sales**: Transaction records
- **sale_items**: Line items for each sale
- **purchases**: Purchase orders from suppliers
- **purchase_items**: Line items for purchases

### Relationships

- `Sales` → `SaleItems` → `Products` (One-to-Many)
- `Products` → `Supplier` (Many-to-One)
- `Sales` → `Customer` (Many-to-One)
- `Sales` → `User` (Many-to-One, tracks which cashier made the sale)

---

## 🔧 Development Commands

### Backend

```powershell
# View logs
docker-compose logs -f backend

# Restart backend
docker-compose restart backend

# Stop all containers
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

### Frontend

```powershell
# Install dependencies
npm install

# Run development server
npm start

# Run Electron app in dev mode
npm run electron-dev

# Build production Electron app
npm run electron-build

# Run tests
npm test
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
- `GET /sales` - List all sales
- `GET /sales/{id}` - Get sale details
- `GET /sales/invoice/{invoice_number}` - Get sale by invoice

### Customers
- `GET /customers` - List customers
- `POST /customers` - Add new customer
- `GET /customers/{id}` - Get customer details

### Suppliers
- `GET /suppliers` - List suppliers
- `POST /suppliers` - Add new supplier
- `GET /suppliers/{id}` - Get supplier details

### Users
- `GET /users` - List all users (Admin only)
- `POST /users` - Create new user (Admin only)
- `PUT /users/{id}` - Update user
- `DELETE /users/{id}` - Delete user

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
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/products" `
  -Method Post `
  -Headers @{ Authorization = "Bearer $token" } `
  -Body $body `
  -ContentType "application/json"
```

### 3. Test POS Flow
1. Login to the app
2. Scan barcode `123456789` (or type it manually)
3. Verify product appears in cart
4. Click "Complete Sale"
5. Check the invoice number generated

---

## 📊 Roadmap

### ✅ Phase 1: MVP (Weeks 1-12) - **IN PROGRESS**
- [x] Docker setup & database design
- [x] Backend API with authentication
- [x] Core POS functionality
- [ ] Product management UI
- [ ] CSV bulk import for products
- [ ] Receipt printing integration
- [ ] User training & deployment

### 🚧 Phase 2: Business Intelligence (Post-Launch)
- [ ] Dashboard with KPIs (sales, profit, top products)
- [ ] Daily/Weekly/Monthly reports
- [ ] GST reports for tax filing
- [ ] Low-stock alerts (email/SMS)
- [ ] Profit margin analysis

### 🔮 Phase 3: Customer Engagement (Future)
- [ ] Customer loyalty program
- [ ] Purchase history tracking
- [ ] SMS/WhatsApp marketing via Twilio
- [ ] Automated birthday discounts
- [ ] "We miss you" campaigns

---

## 🐛 Troubleshooting

### Backend won't start
```powershell
# Check if PostgreSQL is running
docker ps

# View backend logs
docker-compose logs backend

# Restart Docker Desktop
```

### Frontend errors
```powershell
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install

# Clear React cache
Remove-Item -Recurse -Force node_modules/.cache
npm start
```

### Database connection errors
- Verify PostgreSQL is running: `docker ps`
- Check `.env` file has correct `DATABASE_URL`
- Restart containers: `docker-compose restart`

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
