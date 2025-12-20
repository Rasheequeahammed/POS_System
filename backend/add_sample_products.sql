-- Sample Products for Benzy Duty Free Shop

-- Electronics
INSERT INTO products (barcode, name, description, category, cost_price, selling_price, mrp, current_stock, minimum_stock, hsn_code, gst_rate, is_active, created_at, updated_at)
VALUES 
('ELE001', 'Samsung Galaxy S23', '128GB, Phantom Black', 'Electronics', 45000, 55000, 59999, 25, 5, '85171200', 18, 1, NOW(), NOW()),
('ELE002', 'iPhone 14 Pro', '256GB, Space Black', 'Electronics', 85000, 99000, 109999, 15, 3, '85171200', 18, 1, NOW(), NOW()),
('ELE003', 'Sony WH-1000XM5', 'Wireless Noise Cancelling Headphones', 'Electronics', 20000, 24500, 26999, 30, 5, '85183000', 18, 1, NOW(), NOW()),
('ELE004', 'Apple Watch Series 9', 'GPS 45mm', 'Electronics', 35000, 42000, 44999, 20, 4, '85176240', 18, 1, NOW(), NOW());

-- Perfumes & Cosmetics
INSERT INTO products (barcode, name, description, category, cost_price, selling_price, mrp, current_stock, minimum_stock, hsn_code, gst_rate, is_active, created_at, updated_at)
VALUES 
('PRF001', 'Chanel No. 5', '100ml Eau de Parfum', 'Perfumes', 8500, 11000, 12500, 40, 8, '33030010', 18, 1, NOW(), NOW()),
('PRF002', 'Dior Sauvage', '60ml Eau de Toilette', 'Perfumes', 5500, 7200, 8500, 50, 10, '33030010', 18, 1, NOW(), NOW()),
('PRF003', 'YSL Black Opium', '90ml Eau de Parfum', 'Perfumes', 7000, 9500, 10999, 35, 7, '33030010', 18, 1, NOW(), NOW()),
('COS001', 'MAC Ruby Woo Lipstick', 'Matte Lipstick', 'Cosmetics', 1200, 1850, 1990, 60, 15, '33041000', 18, 1, NOW(), NOW()),
('COS002', 'Estee Lauder Night Repair', '50ml Serum', 'Cosmetics', 4500, 6200, 6999, 25, 5, '33049900', 18, 1, NOW(), NOW());

-- Liquor & Beverages
INSERT INTO products (barcode, name, description, category, cost_price, selling_price, mrp, current_stock, minimum_stock, hsn_code, gst_rate, is_active, created_at, updated_at)
VALUES 
('LIQ001', 'Johnnie Walker Black Label', '1L Blended Scotch Whisky', 'Liquor', 2800, 3500, 3999, 100, 20, '22083010', 28, 1, NOW(), NOW()),
('LIQ002', 'Absolut Vodka', '1L Premium Vodka', 'Liquor', 1500, 2000, 2299, 80, 15, '22083020', 28, 1, NOW(), NOW()),
('LIQ003', 'Hennessy VS Cognac', '700ml', 'Liquor', 4500, 5800, 6499, 50, 10, '22083030', 28, 1, NOW(), NOW()),
('LIQ004', 'Bacardi White Rum', '750ml', 'Liquor', 900, 1200, 1399, 90, 18, '22083040', 28, 1, NOW(), NOW()),
('LIQ005', 'Moet & Chandon Champagne', '750ml Brut Imperial', 'Liquor', 3500, 4800, 5499, 40, 8, '22041010', 28, 1, NOW(), NOW());

-- Tobacco Products
INSERT INTO products (barcode, name, description, category, cost_price, selling_price, mrp, current_stock, minimum_stock, hsn_code, gst_rate, is_active, created_at, updated_at)
VALUES 
('TOB001', 'Marlboro Red', 'Pack of 20 Cigarettes', 'Tobacco', 250, 350, 380, 200, 50, '24021000', 28, 1, NOW(), NOW()),
('TOB002', 'Davidoff Classic', 'Pack of 20 Cigarettes', 'Tobacco', 400, 550, 599, 150, 30, '24021000', 28, 1, NOW(), NOW()),
('TOB003', 'Cohiba Siglo VI', 'Cuban Cigar', 'Tobacco', 2500, 3500, 3999, 30, 5, '24021010', 28, 1, NOW(), NOW());

-- Chocolates & Confectionery
INSERT INTO products (barcode, name, description, category, cost_price, selling_price, mrp, current_stock, minimum_stock, hsn_code, gst_rate, is_active, created_at, updated_at)
VALUES 
('CHO001', 'Ferrero Rocher', 'T24 Gift Box', 'Chocolates', 650, 850, 899, 120, 30, '18069000', 18, 1, NOW(), NOW()),
('CHO002', 'Lindt Excellence Dark', '100g 85% Cocoa', 'Chocolates', 280, 380, 399, 150, 40, '18069000', 18, 1, NOW(), NOW()),
('CHO003', 'Toblerone Milk', '360g Swiss Chocolate', 'Chocolates', 450, 599, 649, 100, 25, '18069000', 18, 1, NOW(), NOW()),
('CHO004', 'Godiva Gold Collection', '290g Gift Box', 'Chocolates', 1800, 2400, 2599, 60, 15, '18069000', 18, 1, NOW(), NOW());

-- Watches & Accessories
INSERT INTO products (barcode, name, description, category, cost_price, selling_price, mrp, current_stock, minimum_stock, hsn_code, gst_rate, is_active, created_at, updated_at)
VALUES 
('WAT001', 'Rolex Submariner', 'Automatic Watch', 'Watches', 550000, 685000, 750000, 5, 1, '91021100', 18, 1, NOW(), NOW()),
('WAT002', 'Omega Seamaster', 'Professional Diver 300M', 'Watches', 320000, 395000, 425000, 8, 2, '91021100', 18, 1, NOW(), NOW()),
('WAT003', 'Tag Heuer Carrera', 'Chronograph', 'Watches', 180000, 225000, 245000, 10, 2, '91021100', 18, 1, NOW(), NOW()),
('ACC001', 'Ray-Ban Aviator', 'Classic Sunglasses', 'Accessories', 4500, 6500, 7499, 45, 10, '90041000', 18, 1, NOW(), NOW()),
('ACC002', 'Montblanc Pen', 'Meisterstück Classique', 'Accessories', 25000, 32000, 34999, 20, 4, '96081010', 18, 1, NOW(), NOW());

-- Fashion & Bags
INSERT INTO products (barcode, name, description, category, cost_price, selling_price, mrp, current_stock, minimum_stock, hsn_code, gst_rate, is_active, created_at, updated_at)
VALUES 
('BAG001', 'Louis Vuitton Neverfull', 'MM Monogram Canvas', 'Bags', 85000, 115000, 125000, 12, 3, '42021210', 18, 1, NOW(), NOW()),
('BAG002', 'Gucci Dionysus', 'Small Shoulder Bag', 'Bags', 95000, 125000, 135000, 8, 2, '42021210', 18, 1, NOW(), NOW()),
('FAS001', 'Burberry Trench Coat', 'Classic Heritage', 'Fashion', 75000, 95000, 105000, 15, 3, '62011100', 18, 1, NOW(), NOW()),
('FAS002', 'Ralph Lauren Polo', 'Classic Fit Shirt', 'Fashion', 4500, 6500, 7499, 40, 10, '62052000', 18, 1, NOW(), NOW());

SELECT 'Sample products added successfully!' AS status;
