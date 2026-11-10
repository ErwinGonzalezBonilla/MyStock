-- Esquema (sin datos) de una mystock.db creada con db.create_all()
-- antes de adoptar migraciones. Lo usa tests/test_migrations.py.

CREATE TABLE companies (
	id INTEGER NOT NULL, 
	name VARCHAR(150) NOT NULL, 
	tax_id VARCHAR(50), 
	email VARCHAR(150), 
	phone VARCHAR(50), 
	country VARCHAR(100), 
	currency VARCHAR(10), 
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (tax_id)
);

CREATE TABLE products (
	id INTEGER NOT NULL, 
	company_id INTEGER NOT NULL, 
	name VARCHAR(150) NOT NULL, 
	sku VARCHAR(100) NOT NULL, 
	barcode VARCHAR(100), 
	category VARCHAR(100), 
	buy_price FLOAT NOT NULL, 
	sell_price FLOAT NOT NULL, 
	stock INTEGER NOT NULL, 
	min_stock INTEGER NOT NULL, 
	is_active BOOLEAN DEFAULT 1 NOT NULL, 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	CONSTRAINT uq_products_company_sku UNIQUE (company_id, sku), 
	CONSTRAINT uq_products_company_barcode UNIQUE (company_id, barcode), 
	FOREIGN KEY(company_id) REFERENCES companies (id)
);

CREATE TABLE sales (
	id INTEGER NOT NULL, 
	company_id INTEGER NOT NULL, 
	client_id INTEGER, 
	client_name VARCHAR(150), 
	total FLOAT NOT NULL, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(company_id) REFERENCES companies (id)
);

CREATE TABLE clients (
	id INTEGER NOT NULL, 
	company_id INTEGER NOT NULL, 
	name VARCHAR(150) NOT NULL, 
	tax_id VARCHAR(50), 
	phone VARCHAR(50), 
	email VARCHAR(150), 
	address VARCHAR(255), 
	city VARCHAR(100), 
	postal_code VARCHAR(20), 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(company_id) REFERENCES companies (id)
);

CREATE TABLE suppliers (
	id INTEGER NOT NULL, 
	company_id INTEGER NOT NULL, 
	name VARCHAR(150) NOT NULL, 
	tax_id VARCHAR(50), 
	phone VARCHAR(50), 
	email VARCHAR(150), 
	address VARCHAR(255), 
	city VARCHAR(100), 
	postal_code VARCHAR(20), 
	created_at DATETIME NOT NULL, 
	updated_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(company_id) REFERENCES companies (id)
);

CREATE TABLE purchases (
	id INTEGER NOT NULL, 
	company_id INTEGER NOT NULL, 
	supplier_id INTEGER NOT NULL, 
	supplier_name VARCHAR(150) NOT NULL, 
	total FLOAT NOT NULL, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(company_id) REFERENCES companies (id)
);

CREATE TABLE users (
	id INTEGER NOT NULL, 
	name VARCHAR(150) NOT NULL, 
	email VARCHAR(150) NOT NULL, 
	password_hash VARCHAR(255) NOT NULL, 
	role VARCHAR(50) NOT NULL, 
	company_id INTEGER NOT NULL, 
	is_active BOOLEAN NOT NULL, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	UNIQUE (email), 
	FOREIGN KEY(company_id) REFERENCES companies (id)
);

CREATE TABLE stock_movements (
	id INTEGER NOT NULL, 
	company_id INTEGER NOT NULL, 
	product_id INTEGER NOT NULL, 
	type VARCHAR(20) NOT NULL, 
	quantity INTEGER NOT NULL, 
	reason VARCHAR(255), 
	resulting_stock INTEGER NOT NULL, 
	created_at DATETIME NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(company_id) REFERENCES companies (id), 
	FOREIGN KEY(product_id) REFERENCES products (id)
);

CREATE TABLE sale_items (
	id INTEGER NOT NULL, 
	sale_id INTEGER NOT NULL, 
	product_id INTEGER NOT NULL, 
	quantity INTEGER NOT NULL, 
	unit_price FLOAT NOT NULL, 
	subtotal FLOAT NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(sale_id) REFERENCES sales (id), 
	FOREIGN KEY(product_id) REFERENCES products (id)
);

CREATE TABLE purchase_items (
	id INTEGER NOT NULL, 
	purchase_id INTEGER NOT NULL, 
	product_id INTEGER NOT NULL, 
	quantity INTEGER NOT NULL, 
	unit_price FLOAT NOT NULL, 
	subtotal FLOAT NOT NULL, 
	PRIMARY KEY (id), 
	FOREIGN KEY(purchase_id) REFERENCES purchases (id), 
	FOREIGN KEY(product_id) REFERENCES products (id)
);

CREATE INDEX ix_products_company_id ON products (company_id);

CREATE INDEX ix_sales_company_id ON sales (company_id);

CREATE INDEX ix_clients_company_id ON clients (company_id);

CREATE INDEX ix_suppliers_company_id ON suppliers (company_id);

CREATE INDEX ix_purchases_company_id ON purchases (company_id);

CREATE INDEX ix_users_company_id ON users (company_id);

CREATE INDEX ix_stock_movements_company_id ON stock_movements (company_id);

