-- Benzy Duty Free Shop Database Initialization Script
-- This script creates initial tables and seed data

-- Enable UUID extension (optional, for future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'cashier',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on username for faster lookups
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- Create Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    gstin VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suppliers_name ON suppliers(name);

-- Create Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    barcode VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    cost_price DECIMAL(10, 2) NOT NULL,
    selling_price DECIMAL(10, 2) NOT NULL,
    mrp DECIMAL(10, 2),
    current_stock INTEGER DEFAULT 0 NOT NULL,
    minimum_stock INTEGER DEFAULT 5,
    hsn_code VARCHAR(20),
    gst_rate DECIMAL(5, 2) DEFAULT 0.0,
    supplier_id INTEGER REFERENCES suppliers(id),
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);

-- Create Customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    phone VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(100),
    address TEXT,
    date_of_birth DATE,
    first_purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_purchases INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_phone ON customers(phone);

-- Create Sales table
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.0,
    tax_amount DECIMAL(10, 2) DEFAULT 0.0,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'cash',
    payment_status VARCHAR(20) DEFAULT 'completed',
    notes TEXT,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_invoice ON sales(invoice_number);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_sales_user ON sales(user_id);

-- Create Sale Items table
CREATE TABLE IF NOT EXISTS sale_items (
    id SERIAL PRIMARY KEY,
    sale_id INTEGER REFERENCES sales(id) NOT NULL,
    product_id INTEGER REFERENCES products(id) NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    barcode VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0.0,
    tax_rate DECIMAL(5, 2) DEFAULT 0.0,
    tax_amount DECIMAL(10, 2) DEFAULT 0.0,
    line_total DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_product ON sale_items(product_id);

-- Create Purchases table
CREATE TABLE IF NOT EXISTS purchases (
    id SERIAL PRIMARY KEY,
    purchase_order_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending',
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expected_delivery TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_purchases_po ON purchases(purchase_order_number);
CREATE INDEX idx_purchases_date ON purchases(purchase_date);

-- Create Purchase Items table
CREATE TABLE IF NOT EXISTS purchase_items (
    id SERIAL PRIMARY KEY,
    purchase_id INTEGER REFERENCES purchases(id) NOT NULL,
    product_id INTEGER REFERENCES products(id) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10, 2) NOT NULL,
    line_total DECIMAL(10, 2) NOT NULL
);

CREATE INDEX idx_purchase_items_purchase ON purchase_items(purchase_id);
CREATE INDEX idx_purchase_items_product ON purchase_items(product_id);

-- Insert default admin user (password: admin123)
-- In production, this should be changed immediately!
INSERT INTO users (username, email, full_name, hashed_password, role) 
VALUES (
    'admin', 
    'admin@benzyshop.com', 
    'Administrator', 
    '$2b$12$EixZaYVK1fsbw1ZfbX3OXe.tXBdW.FpBpK8F3T5P8Sv8QZqB3KrNa',  -- admin123
    'ADMIN'
) ON CONFLICT (username) DO NOTHING;

-- Insert sample categories (optional)
-- These will help during initial setup
COMMENT ON TABLE products IS 'Stores all product information including pricing, stock, and tax details';
COMMENT ON TABLE sales IS 'Records all sales transactions with payment and customer information';
COMMENT ON TABLE sale_items IS 'Line items for each sale with pricing snapshot at time of purchase';
