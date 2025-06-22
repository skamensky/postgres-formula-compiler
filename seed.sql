-- Migrations will appear here as you chat with AI

-- Core application tables
create table app_user (
  id bigint primary key generated always as identity,
  email text unique not null,
  full_name text not null,
  role text not null,
  last_login_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  created_by bigint references app_user (id),
  updated_at timestamptz default now(),
  updated_by bigint references app_user (id)
);

create table rep (
  id bigint primary key generated always as identity,
  user_id bigint references app_user (id),
  region text not null,
  license_number text not null,
  phone_number text not null,
  joined_date date not null,
  active boolean not null default true,
  created_at timestamptz default now(),
  created_by bigint references app_user (id),
  updated_at timestamptz default now(),
  updated_by bigint references app_user (id)
);

create table customer (
  id bigint primary key generated always as identity,
  full_name text not null,
  email text not null,
  phone_number text not null,
  lead_source text not null,
  preferred_contact_method text not null,
  status text not null,
  notes text,
  created_at timestamptz default now(),
  created_by bigint references app_user (id),
  updated_at timestamptz default now(),
  updated_by bigint references app_user (id)
);

create table listing (
  id bigint primary key generated always as identity,
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  price numeric not null,
  status text not null,
  listing_type text not null,
  bedrooms int not null,
  bathrooms int not null,
  square_feet int not null,
  listing_agent_id bigint references rep (id),
  created_at timestamptz default now(),
  created_by bigint references app_user (id),
  updated_at timestamptz default now(),
  updated_by bigint references app_user (id)
);

create table opportunity (
  id bigint primary key generated always as identity,
  customer_id bigint references customer (id),
  listing_id bigint references listing (id),
  stage text not null,
  expected_close_date date,
  value_estimate numeric,
  priority text not null,
  notes text,
  created_at timestamptz default now(),
  created_by bigint references app_user (id),
  updated_at timestamptz default now(),
  updated_by bigint references app_user (id)
);

create table rep_link (
  id bigint primary key generated always as identity,
  rep_id bigint references rep (id),
  opportunity_id bigint references opportunity (id),
  role text not null,
  commission_percentage numeric not null,
  created_at timestamptz default now(),
  created_by bigint references app_user (id),
  updated_at timestamptz default now(),
  updated_by bigint references app_user (id)
);

-- Additional tables for original formula system compatibility
create table merchant (
  id bigint primary key generated always as identity,
  business_name text not null,
  main_rep_id bigint references rep (id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table submission (
  id bigint primary key generated always as identity,
  merchant_id bigint references merchant (id),
  amount numeric not null default 0,
  lender_fee numeric not null default 0,
  status text not null default 'pending',
  note text,
  date_funded date,
  priority text not null default 'medium',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Formula system metadata tables
create table table_info (
  id bigint primary key generated always as identity,
  table_name text unique not null,
  description text
);

create table table_field (
  id bigint primary key generated always as identity,
  table_info bigint references table_info (id),
  name text not null,
  data_type text not null,
  description text
);

create table relationship_lookups (
  id bigint primary key generated always as identity,
  source_table_name text not null,
  col_name text not null,
  target_table_name text not null
);

-- Insert table metadata
INSERT INTO table_info (table_name, description) VALUES 
  ('app_user', 'Application users'),
  ('rep', 'Sales representatives'),
  ('customer', 'Customer records'),
  ('listing', 'Property listings'),
  ('opportunity', 'Sales opportunities'),
  ('rep_link', 'Representative-opportunity relationships'),
  ('merchant', 'Merchant/business records'),
  ('submission', 'Funding submissions');

-- Insert field metadata for each table
INSERT INTO table_field (table_info, name, data_type) 
SELECT ti.id, field_name, field_type
FROM table_info ti
CROSS JOIN (VALUES 
  ('app_user', 'id', 'bigint'),
  ('app_user', 'email', 'text'),
  ('app_user', 'full_name', 'text'),
  ('app_user', 'role', 'text'),
  ('app_user', 'last_login_at', 'timestamptz'),
  ('app_user', 'is_active', 'boolean'),
  ('app_user', 'created_at', 'timestamptz'),
  ('app_user', 'created_by', 'bigint'),
  ('app_user', 'updated_at', 'timestamptz'),
  ('app_user', 'updated_by', 'bigint'),
  
  ('rep', 'id', 'bigint'),
  ('rep', 'user_id', 'bigint'),
  ('rep', 'region', 'text'),
  ('rep', 'license_number', 'text'),
  ('rep', 'phone_number', 'text'),
  ('rep', 'joined_date', 'date'),
  ('rep', 'active', 'boolean'),
  ('rep', 'created_at', 'timestamptz'),
  ('rep', 'created_by', 'bigint'),
  ('rep', 'updated_at', 'timestamptz'),
  ('rep', 'updated_by', 'bigint'),
  
  ('customer', 'id', 'bigint'),
  ('customer', 'full_name', 'text'),
  ('customer', 'email', 'text'),
  ('customer', 'phone_number', 'text'),
  ('customer', 'lead_source', 'text'),
  ('customer', 'preferred_contact_method', 'text'),
  ('customer', 'status', 'text'),
  ('customer', 'notes', 'text'),
  ('customer', 'created_at', 'timestamptz'),
  ('customer', 'created_by', 'bigint'),
  ('customer', 'updated_at', 'timestamptz'),
  ('customer', 'updated_by', 'bigint'),
  
  ('listing', 'id', 'bigint'),
  ('listing', 'address', 'text'),
  ('listing', 'city', 'text'),
  ('listing', 'state', 'text'),
  ('listing', 'zip_code', 'text'),
  ('listing', 'price', 'numeric'),
  ('listing', 'status', 'text'),
  ('listing', 'listing_type', 'text'),
  ('listing', 'bedrooms', 'integer'),
  ('listing', 'bathrooms', 'integer'),
  ('listing', 'square_feet', 'integer'),
  ('listing', 'listing_agent_id', 'bigint'),
  ('listing', 'created_at', 'timestamptz'),
  ('listing', 'created_by', 'bigint'),
  ('listing', 'updated_at', 'timestamptz'),
  ('listing', 'updated_by', 'bigint'),
  
  ('opportunity', 'id', 'bigint'),
  ('opportunity', 'customer_id', 'bigint'),
  ('opportunity', 'listing_id', 'bigint'),
  ('opportunity', 'stage', 'text'),
  ('opportunity', 'expected_close_date', 'date'),
  ('opportunity', 'value_estimate', 'numeric'),
  ('opportunity', 'priority', 'text'),
  ('opportunity', 'notes', 'text'),
  ('opportunity', 'created_at', 'timestamptz'),
  ('opportunity', 'created_by', 'bigint'),
  ('opportunity', 'updated_at', 'timestamptz'),
  ('opportunity', 'updated_by', 'bigint'),
  
  ('rep_link', 'id', 'bigint'),
  ('rep_link', 'rep_id', 'bigint'),
  ('rep_link', 'opportunity_id', 'bigint'),
  ('rep_link', 'role', 'text'),
  ('rep_link', 'commission_percentage', 'numeric'),
  ('rep_link', 'created_at', 'timestamptz'),
  ('rep_link', 'created_by', 'bigint'),
  ('rep_link', 'updated_at', 'timestamptz'),
  ('rep_link', 'updated_by', 'bigint'),
  
  ('merchant', 'id', 'bigint'),
  ('merchant', 'business_name', 'text'),
  ('merchant', 'main_rep_id', 'bigint'),
  ('merchant', 'created_at', 'timestamptz'),
  ('merchant', 'updated_at', 'timestamptz'),
  
  ('submission', 'id', 'bigint'),
  ('submission', 'merchant_id', 'bigint'),
  ('submission', 'amount', 'numeric'),
  ('submission', 'lender_fee', 'numeric'),
  ('submission', 'status', 'text'),
  ('submission', 'note', 'text'),
  ('submission', 'date_funded', 'date'),
  ('submission', 'priority', 'text'),
  ('submission', 'created_at', 'timestamptz'),
  ('submission', 'updated_at', 'timestamptz')
) AS field_data(table_name, field_name, field_type)
WHERE ti.table_name = field_data.table_name;

-- Insert relationship metadata
INSERT INTO relationship_lookups (source_table_name, col_name, target_table_name) VALUES
  ('app_user', 'created_by', 'app_user'),
  ('app_user', 'updated_by', 'app_user'),
  ('rep', 'user_id', 'app_user'),
  ('rep', 'created_by', 'app_user'),
  ('rep', 'updated_by', 'app_user'),
  ('customer', 'created_by', 'app_user'),
  ('customer', 'updated_by', 'app_user'),
  ('listing', 'listing_agent_id', 'rep'),
  ('listing', 'created_by', 'app_user'),
  ('listing', 'updated_by', 'app_user'),
  ('opportunity', 'customer_id', 'customer'),
  ('opportunity', 'listing_id', 'listing'),
  ('opportunity', 'created_by', 'app_user'),
  ('opportunity', 'updated_by', 'app_user'),
  ('rep_link', 'rep_id', 'rep'),
  ('rep_link', 'opportunity_id', 'opportunity'),
  ('rep_link', 'created_by', 'app_user'),
  ('rep_link', 'updated_by', 'app_user'),
  ('merchant', 'main_rep_id', 'rep'),
  ('submission', 'merchant_id', 'merchant');

-- Insert sample data
INSERT INTO app_user (email, full_name, role, is_active) VALUES
  ('admin@example.com', 'System Admin', 'admin', true),
  ('david.vingart@example.com', 'David Vingart', 'rep', true),
  ('zack.wolf@example.com', 'Zack Wolf', 'rep', true),
  ('rachel.barnett@example.com', 'Rachel Barnett', 'rep', true);

INSERT INTO rep (user_id, region, license_number, phone_number, joined_date, active) VALUES
  (2, 'North', 'LIC001', '555-0101', '2023-01-15', true),
  (3, 'South', 'LIC002', '555-0102', '2023-02-20', true),
  (4, 'East', 'LIC003', '555-0103', '2023-03-10', true);

INSERT INTO customer (full_name, email, phone_number, lead_source, preferred_contact_method, status, created_by) VALUES
  ('John Smith', 'john.smith@example.com', '555-1001', 'Website', 'Email', 'Active', 1),
  ('Jane Doe', 'jane.doe@example.com', '555-1002', 'Referral', 'Phone', 'Active', 1),
  ('Bob Johnson', 'bob.johnson@example.com', '555-1003', 'Advertisement', 'Email', 'Inactive', 1);

INSERT INTO listing (address, city, state, zip_code, price, status, listing_type, bedrooms, bathrooms, square_feet, listing_agent_id, created_by) VALUES
  ('123 Main St', 'Springfield', 'IL', '62701', 250000, 'Active', 'House', 3, 2, 1500, 1, 1),
  ('456 Oak Ave', 'Springfield', 'IL', '62702', 350000, 'Active', 'House', 4, 3, 2200, 2, 1),
  ('789 Pine Blvd', 'Springfield', 'IL', '62703', 450000, 'Sold', 'House', 5, 4, 2800, 3, 1);

INSERT INTO opportunity (customer_id, listing_id, stage, expected_close_date, value_estimate, priority, notes, created_by) VALUES
  (1, 1, 'Qualified', '2024-02-15', 250000, 'High', 'First-time buyer, pre-approved', 1),
  (2, 2, 'Proposal', '2024-03-01', 340000, 'Medium', 'Negotiating price', 1),
  (3, 3, 'Closed Won', '2023-12-15', 450000, 'High', 'Successful closing', 1);

INSERT INTO rep_link (rep_id, opportunity_id, role, commission_percentage, created_by) VALUES
  (1, 1, 'Primary', 100.0, 1),
  (2, 2, 'Primary', 70.0, 1),
  (3, 2, 'Support', 30.0, 1),
  (3, 3, 'Primary', 100.0, 1);

INSERT INTO merchant (business_name, main_rep_id) VALUES
  ('TAX HOUSE LLC', 1),
  ('ACCOUNTING SERVICES INC', 2),
  ('FINANCIAL ADVISORS GROUP', 3);

INSERT INTO submission (merchant_id, amount, lender_fee, status, note, date_funded, priority) VALUES
  (1, 50000, 2500, 'approved', 'Tax season funding request', '2024-01-15', 'high'),
  (2, 75000, 3750, 'pending', NULL, NULL, 'medium'),
  (3, 100000, 5000, 'funded', 'Annual growth capital', '2023-12-20', 'high');