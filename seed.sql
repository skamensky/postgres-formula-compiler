-- Real Estate CRM Database Schema
-- Rich sample data for formula testing and demos

-- Clean slate
DROP TABLE IF EXISTS rep_link CASCADE;
DROP TABLE IF EXISTS opportunity CASCADE;
DROP TABLE IF EXISTS listing CASCADE;
DROP TABLE IF EXISTS customer CASCADE;
DROP TABLE IF EXISTS rep CASCADE;
DROP TABLE IF EXISTS app_user CASCADE;

-- Core user table
CREATE TABLE app_user (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales representatives
CREATE TABLE rep (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES app_user (id),
  name TEXT NOT NULL,
  region TEXT NOT NULL,
  license_number TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  hire_date DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  sales_goal NUMERIC DEFAULT 0,
  commission_rate NUMERIC DEFAULT 0.03,
  manager_id BIGINT REFERENCES rep (id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customer/buyer records
CREATE TABLE customer (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  lead_source TEXT NOT NULL,
  budget_min NUMERIC,
  budget_max NUMERIC,
  preferred_bedrooms INTEGER,
  preferred_bathrooms NUMERIC,
  status TEXT NOT NULL DEFAULT 'lead',
  notes TEXT,
  assigned_rep_id BIGINT REFERENCES rep (id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property listings
CREATE TABLE listing (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  listing_price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  property_type TEXT NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms NUMERIC NOT NULL,
  square_feet INTEGER NOT NULL,
  lot_size NUMERIC,
  year_built INTEGER,
  listing_date DATE NOT NULL,
  days_on_market INTEGER,
  listing_agent_id BIGINT REFERENCES rep (id),
  description TEXT,
  features TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales opportunities/deals
CREATE TABLE opportunity (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  customer_id BIGINT REFERENCES customer (id),
  listing_id BIGINT REFERENCES listing (id),
  stage TEXT NOT NULL DEFAULT 'lead',
  offer_amount NUMERIC,
  closing_date DATE,
  sale_price NUMERIC,
  commission_total NUMERIC,
  financing_type TEXT,
  inspection_completed BOOLEAN DEFAULT false,
  appraisal_completed BOOLEAN DEFAULT false,
  contract_signed_date DATE,
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rep-opportunity commission splits
CREATE TABLE rep_link (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  rep_id BIGINT REFERENCES rep (id),
  opportunity_id BIGINT REFERENCES opportunity (id),
  role TEXT NOT NULL,
  commission_percentage NUMERIC NOT NULL,
  commission_amount NUMERIC,
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sample Users
INSERT INTO app_user (email, full_name, role, is_active, last_login_at) VALUES
  ('admin@realtygroup.com', 'Sarah Admin', 'admin', true, '2024-01-15 09:00:00'),
  ('michael.johnson@realtygroup.com', 'Michael Johnson', 'rep', true, '2024-01-15 14:30:00'),
  ('jessica.chen@realtygroup.com', 'Jessica Chen', 'rep', true, '2024-01-15 16:45:00'),
  ('david.martinez@realtygroup.com', 'David Martinez', 'rep', true, '2024-01-15 11:20:00'),
  ('emily.rodriguez@realtygroup.com', 'Emily Rodriguez', 'rep', true, '2024-01-15 13:15:00'),
  ('robert.taylor@realtygroup.com', 'Robert Taylor', 'manager', true, '2024-01-15 08:30:00'),
  ('lisa.anderson@realtygroup.com', 'Lisa Anderson', 'rep', true, '2024-01-15 15:10:00');

-- Sample Representatives
INSERT INTO rep (user_id, name, region, license_number, phone_number, email, hire_date, active, sales_goal, commission_rate, manager_id) VALUES
  (2, 'Michael Johnson', 'Downtown', 'RE123456', '555-0101', 'michael.johnson@realtygroup.com', '2022-03-15', true, 2500000, 0.03, NULL),
  (3, 'Jessica Chen', 'Westside', 'RE123457', '555-0102', 'jessica.chen@realtygroup.com', '2021-08-20', true, 3000000, 0.035, NULL),
  (4, 'David Martinez', 'Northside', 'RE123458', '555-0103', 'david.martinez@realtygroup.com', '2023-01-10', true, 2000000, 0.03, 6),
  (5, 'Emily Rodriguez', 'Eastside', 'RE123459', '555-0104', 'emily.rodriguez@realtygroup.com', '2022-11-05', true, 2800000, 0.032, 6),
  (6, 'Robert Taylor', 'Management', 'RE123460', '555-0105', 'robert.taylor@realtygroup.com', '2020-01-15', true, 0, 0.01, NULL),
  (7, 'Lisa Anderson', 'Suburbs', 'RE123461', '555-0106', 'lisa.anderson@realtygroup.com', '2023-06-01', true, 1800000, 0.028, 6);

-- Sample Customers
INSERT INTO customer (first_name, last_name, email, phone, address, city, state, zip_code, lead_source, budget_min, budget_max, preferred_bedrooms, preferred_bathrooms, status, notes, assigned_rep_id) VALUES
  ('John', 'Smith', 'john.smith@email.com', '555-1001', '123 Current St', 'Springfield', 'IL', '62701', 'Website', 300000, 450000, 3, 2, 'active', 'First-time buyer, pre-approved for $400K', 1),
  ('Sarah', 'Davis', 'sarah.davis@email.com', '555-1002', '456 Oak Ave', 'Springfield', 'IL', '62702', 'Referral', 500000, 700000, 4, 3, 'active', 'Looking to upgrade, needs good schools', 2),
  ('Mike', 'Wilson', 'mike.wilson@email.com', '555-1003', '789 Pine St', 'Springfield', 'IL', '62703', 'Advertisement', 200000, 350000, 2, 2, 'prospect', 'Young professional, flexible on location', 3),
  ('Lisa', 'Brown', 'lisa.brown@email.com', '555-1004', '321 Elm Dr', 'Springfield', 'IL', '62704', 'Website', 600000, 900000, 5, 4, 'active', 'Luxury buyer, wants pool and large lot', 2),
  ('Tom', 'Miller', 'tom.miller@email.com', '555-1005', '654 Maple Ln', 'Springfield', 'IL', '62705', 'Social Media', 250000, 400000, 3, 2, 'lead', 'Relocating for work, needs quick close', 4),
  ('Jennifer', 'Garcia', 'jennifer.garcia@email.com', '555-1006', '987 Cedar Rd', 'Springfield', 'IL', '62706', 'Referral', 400000, 550000, 3, 3, 'active', 'Investment property buyer', 1),
  ('Kevin', 'Taylor', 'kevin.taylor@email.com', '555-1007', '147 Birch Way', 'Springfield', 'IL', '62707', 'Website', 350000, 500000, 4, 2, 'prospect', 'Growing family, needs yard space', 5),
  ('Amanda', 'White', 'amanda.white@email.com', '555-1008', '258 Spruce St', 'Springfield', 'IL', '62708', 'Past Client', 800000, 1200000, 6, 5, 'active', 'Executive relocation, luxury preferred', 2);

-- Sample Listings
INSERT INTO listing (address, city, state, zip_code, listing_price, status, property_type, bedrooms, bathrooms, square_feet, lot_size, year_built, listing_date, days_on_market, listing_agent_id, description, features) VALUES
  ('1234 Sunset Blvd', 'Springfield', 'IL', '62701', 385000, 'active', 'Single Family', 3, 2.5, 2100, 0.25, 2018, '2024-01-01', 21, 1, 'Beautiful modern home with open floor plan', ARRAY['Granite Counters', 'Hardwood Floors', 'Two Car Garage']),
  ('5678 Ocean View Dr', 'Springfield', 'IL', '62702', 675000, 'active', 'Single Family', 4, 3, 2800, 0.5, 2020, '2024-01-05', 17, 2, 'Stunning contemporary with panoramic views', ARRAY['Pool', 'Home Theater', 'Wine Cellar', 'Smart Home']),
  ('9012 Mountain Ridge', 'Springfield', 'IL', '62703', 425000, 'pending', 'Single Family', 3, 2, 1950, 0.3, 2015, '2023-12-15', 38, 3, 'Charming craftsman style with character', ARRAY['Fireplace', 'Deck', 'Updated Kitchen']),
  ('3456 Lake Shore Dr', 'Springfield', 'IL', '62704', 950000, 'active', 'Single Family', 5, 4.5, 4200, 1.2, 2022, '2024-01-10', 12, 2, 'Luxury lakefront estate with private dock', ARRAY['Pool', 'Guest House', 'Boat Dock', 'Chef Kitchen']),
  ('7890 Valley View Ct', 'Springfield', 'IL', '62705', 295000, 'sold', 'Townhouse', 2, 2, 1400, 0.1, 2019, '2023-11-20', 63, 4, 'Low maintenance townhome in gated community', ARRAY['HOA Pool', 'Patio', 'In-Unit Laundry']),
  ('2468 Hilltop Way', 'Springfield', 'IL', '62706', 525000, 'active', 'Single Family', 4, 3, 2400, 0.4, 2017, '2024-01-08', 14, 1, 'Move-in ready with recent updates throughout', ARRAY['Solar Panels', 'Backup Generator', 'Workshop']),
  ('1357 Garden Lane', 'Springfield', 'IL', '62707', 465000, 'active', 'Single Family', 3, 2.5, 2200, 0.35, 2021, '2024-01-12', 10, 5, 'New construction with energy efficient features', ARRAY['Quartz Counters', 'Smart Thermostat', 'Ring Doorbell']),
  ('8024 Riverside Ave', 'Springfield', 'IL', '62708', 1150000, 'active', 'Single Family', 6, 5, 5100, 2.1, 2023, '2024-01-03', 19, 2, 'Brand new luxury custom build', ARRAY['Home Office', 'Movie Room', 'Wine Room', 'Elevator']),
  ('4680 Parkview Dr', 'Springfield', 'IL', '62709', 340000, 'contingent', 'Single Family', 3, 2, 1800, 0.2, 2016, '2023-12-28', 25, 6, 'Well maintained home across from park', ARRAY['Fenced Yard', 'Shed', 'Central Air']),
  ('9753 Heritage St', 'Springfield', 'IL', '62710', 275000, 'active', 'Condo', 2, 2, 1200, 0, 2020, '2024-01-14', 8, 3, 'Modern condo with city views and amenities', ARRAY['Balcony', 'Gym Access', 'Concierge']);

-- Sample Opportunities
INSERT INTO opportunity (customer_id, listing_id, stage, offer_amount, closing_date, sale_price, commission_total, financing_type, inspection_completed, appraisal_completed, contract_signed_date, probability, notes) VALUES
  (1, 1, 'under_contract', 375000, '2024-02-15', NULL, NULL, 'Conventional', true, true, '2024-01-20', 95, 'Inspection passed, waiting on final loan approval'),
  (2, 2, 'negotiating', 650000, NULL, NULL, NULL, 'Jumbo', false, false, NULL, 70, 'Multiple offers, client considering counter'),
  (3, 5, 'closed', 295000, '2024-01-25', 295000, 8850, 'FHA', true, true, '2023-12-05', 100, 'Successful closing, happy first-time buyers'),
  (4, 4, 'showing', NULL, NULL, NULL, NULL, 'Cash', false, false, NULL, 40, 'Second showing scheduled, very interested'),
  (5, 6, 'under_contract', 515000, '2024-02-28', NULL, NULL, 'VA', true, false, '2024-01-22', 85, 'VA appraisal ordered, buyer relocating for job'),
  (6, 9, 'contingent', 335000, '2024-03-10', NULL, NULL, 'Investment', false, false, '2024-01-15', 75, 'Sale contingent on buyer selling current property'),
  (7, 7, 'negotiating', 450000, NULL, NULL, NULL, 'Conventional', false, false, NULL, 60, 'Price negotiation in progress'),
  (8, 8, 'showing', NULL, NULL, NULL, NULL, 'Cash', false, false, NULL, 30, 'Initial showing, looking at several luxury properties'),
  (2, 10, 'lead', NULL, NULL, NULL, NULL, NULL, false, false, NULL, 20, 'Interested in downtown living, early stage'),
  (1, 3, 'lost', 410000, NULL, NULL, NULL, 'Conventional', false, false, NULL, 0, 'Buyer chose different property, price too high');

-- Sample Commission Splits
INSERT INTO rep_link (rep_id, opportunity_id, role, commission_percentage, commission_amount, paid_date) VALUES
  (1, 1, 'Listing Agent', 50.0, NULL, NULL),
  (3, 1, 'Buyer Agent', 50.0, NULL, NULL),
  (2, 2, 'Listing Agent', 60.0, NULL, NULL),
  (1, 2, 'Buyer Agent', 40.0, NULL, NULL),
  (4, 3, 'Listing Agent', 100.0, 8850, '2024-01-30'),
  (2, 4, 'Listing Agent', 50.0, NULL, NULL),
  (2, 4, 'Buyer Agent', 50.0, NULL, NULL),
  (1, 5, 'Listing Agent', 50.0, NULL, NULL),
  (4, 5, 'Buyer Agent', 50.0, NULL, NULL),
  (6, 6, 'Listing Agent', 100.0, NULL, NULL),
  (5, 7, 'Listing Agent', 50.0, NULL, NULL),
  (4, 7, 'Buyer Agent', 50.0, NULL, NULL),
  (2, 8, 'Listing Agent', 50.0, NULL, NULL),
  (2, 8, 'Buyer Agent', 50.0, NULL, NULL),
  (2, 9, 'Listing Agent', 100.0, NULL, NULL),
  (3, 10, 'Listing Agent', 50.0, NULL, NULL),
  (1, 10, 'Buyer Agent', 50.0, NULL, NULL);