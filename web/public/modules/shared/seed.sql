-- Real Estate CRM Database Schema
-- Rich, diverse sample data showcasing real-world complexity and edge cases

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

-- Sample Users (More diverse team)
INSERT INTO app_user (email, full_name, role, is_active, last_login_at) VALUES
  ('admin@realtygroup.com', 'Sarah Admin', 'admin', true, '2024-01-15 09:00:00'),
  ('michael.johnson@realtygroup.com', 'Michael Johnson', 'rep', true, '2024-01-15 14:30:00'),
  ('jessica.chen@realtygroup.com', 'Jessica Chen', 'rep', true, '2024-01-15 16:45:00'),
  ('david.martinez@realtygroup.com', 'David Martinez', 'rep', true, '2024-01-15 11:20:00'),
  ('emily.rodriguez@realtygroup.com', 'Emily Rodriguez', 'rep', true, '2024-01-15 13:15:00'),
  ('robert.taylor@realtygroup.com', 'Robert Taylor', 'manager', true, '2024-01-15 08:30:00'),
  ('lisa.anderson@realtygroup.com', 'Lisa Anderson', 'rep', true, '2024-01-15 15:10:00'),
  ('james.wilson@realtygroup.com', 'James Wilson', 'rep', true, '2024-01-14 10:22:00'),
  ('maria.gonzalez@realtygroup.com', 'Maria Gonzalez', 'rep', true, '2024-01-14 16:45:00'),
  ('kevin.brown@realtygroup.com', 'Kevin Brown', 'rep', true, '2024-01-13 14:12:00'),
  ('rachel.davis@realtygroup.com', 'Rachel Davis', 'rep', true, '2024-01-13 09:30:00'),
  ('thomas.miller@realtygroup.com', 'Thomas Miller', 'rep', false, '2024-01-10 11:15:00'),
  ('jennifer.lee@realtygroup.com', 'Jennifer Lee', 'rep', true, '2024-01-12 15:45:00');

-- Sample Representatives (Diverse specialties and experience levels)
INSERT INTO rep (user_id, name, region, license_number, phone_number, email, hire_date, active, sales_goal, commission_rate, manager_id) VALUES
  (2, 'Michael Johnson', 'Downtown', 'RE123456', '555-0101', 'michael.johnson@realtygroup.com', '2022-03-15', true, 2500000, 0.03, 6),
  (3, 'Jessica Chen', 'Westside', 'RE123457', '555-0102', 'jessica.chen@realtygroup.com', '2021-08-20', true, 3500000, 0.035, 6),
  (4, 'David Martinez', 'Northside', 'RE123458', '555-0103', 'david.martinez@realtygroup.com', '2023-01-10', true, 2000000, 0.03, 6),
  (5, 'Emily Rodriguez', 'Eastside', 'RE123459', '555-0104', 'emily.rodriguez@realtygroup.com', '2022-11-05', true, 2800000, 0.032, 6),
  (6, 'Robert Taylor', 'Management', 'RE123460', '555-0105', 'robert.taylor@realtygroup.com', '2020-01-15', true, 0, 0.01, NULL),
  (7, 'Lisa Anderson', 'Suburbs', 'RE123461', '555-0106', 'lisa.anderson@realtygroup.com', '2023-06-01', true, 1800000, 0.028, 6),
  (8, 'James Wilson', 'Luxury', 'RE123462', '555-0107', 'james.wilson@realtygroup.com', '2019-05-12', true, 5000000, 0.04, NULL),
  (9, 'Maria Gonzalez', 'Commercial', 'RE123463', '555-0108', 'maria.gonzalez@realtygroup.com', '2020-09-03', true, 4200000, 0.025, NULL),
  (10, 'Kevin Brown', 'First-Time Buyers', 'RE123464', '555-0109', 'kevin.brown@realtygroup.com', '2023-02-14', true, 1500000, 0.035, 6),
  (11, 'Rachel Davis', 'Investment Properties', 'RE123465', '555-0110', 'rachel.davis@realtygroup.com', '2021-11-30', true, 3200000, 0.03, NULL),
  (12, 'Thomas Miller', 'Relocations', 'RE123466', '555-0111', 'thomas.miller@realtygroup.com', '2022-07-18', false, 2200000, 0.032, 6),
  (13, 'Jennifer Lee', 'New Construction', 'RE123467', '555-0112', 'jennifer.lee@realtygroup.com', '2023-04-22', true, 2700000, 0.033, 6);

-- Sample Customers (Much more diverse scenarios)
INSERT INTO customer (first_name, last_name, email, phone, address, city, state, zip_code, lead_source, budget_min, budget_max, preferred_bedrooms, preferred_bathrooms, status, notes, assigned_rep_id) VALUES
  -- High-activity investor with multiple deals
  ('Marcus', 'Thompson', 'marcus.thompson@email.com', '555-2001', '100 Business Plaza', 'Springfield', 'IL', '62701', 'Referral', 200000, 2000000, NULL, NULL, 'active', 'Real estate investor, portfolio expansion', 10),
  
  -- Luxury buyer with specific requirements  
  ('Victoria', 'Sterling', 'victoria.sterling@email.com', '555-2002', '555 Executive Dr', 'Springfield', 'IL', '62702', 'Past Client', 1500000, 3500000, 5, 4, 'active', 'Corporate executive, needs luxury amenities', 7),
  
  -- First-time buyer, price sensitive
  ('Alex', 'Rivera', 'alex.rivera@email.com', '555-2003', '789 College Ave', 'Springfield', 'IL', '62703', 'Website', 180000, 280000, 2, 1, 'active', 'First-time buyer, tight budget, pre-approved', 9),
  
  -- Corporate relocation, multiple family members
  ('Jennifer', 'Chang', 'jennifer.chang@email.com', '555-2004', '456 Corporate Way', 'Springfield', 'IL', '62704', 'Corporate Referral', 450000, 650000, 4, 3, 'active', 'Corporate relocation, needs quick closing', 11),
  
  -- Downsizing retirees
  ('Robert', 'Wilson', 'robert.wilson@email.com', '555-2005', '123 Retirement Ln', 'Springfield', 'IL', '62705', 'Referral', 300000, 450000, 2, 2, 'prospect', 'Downsizing from large home, no rush', 6),
  
  -- Young professionals, dual income
  ('Emma', 'Foster', 'emma.foster@email.com', '555-2006', '321 Tech Park', 'Springfield', 'IL', '62706', 'Social Media', 350000, 500000, 3, 2, 'active', 'Dual income, tech workers, modern preferences', 2),
  
  -- International buyer, cash purchase
  ('Hiroshi', 'Tanaka', 'hiroshi.tanaka@email.com', '555-2007', '999 International Blvd', 'Springfield', 'IL', '62707', 'Agent Network', 800000, 1200000, 4, 3, 'active', 'International buyer, cash only, investment focus', 7),
  
  -- Growing family, needs space
  ('Sarah', 'Johnson', 'sarah.johnson@email.com', '555-2008', '147 Family Circle', 'Springfield', 'IL', '62708', 'Website', 400000, 600000, 4, 3, 'prospect', 'Growing family, needs yard and schools', 3),
  
  -- Divorce situation, urgent timeline
  ('Michael', 'Peters', 'michael.peters@email.com', '555-2009', '258 Transition St', 'Springfield', 'IL', '62709', 'Attorney Referral', 250000, 400000, 2, 2, 'active', 'Divorce settlement, needs quick sale/purchase', 1),
  
  -- Empty nesters, luxury condo interest
  ('Linda', 'Martinez', 'linda.martinez@email.com', '555-2010', '369 Empty Nest Dr', 'Springfield', 'IL', '62710', 'Past Client', 500000, 800000, 2, 2, 'prospect', 'Empty nesters, want low maintenance luxury', 7),
  
  -- Investment group representative
  ('David', 'Kumar', 'david.kumar@email.com', '555-2011', '147 Investment Ave', 'Springfield', 'IL', '62711', 'Business Network', 300000, 1500000, NULL, NULL, 'active', 'Investment group, looking for rental properties', 10),
  
  -- New construction buyer
  ('Ashley', 'Clark', 'ashley.clark@email.com', '555-2012', '852 Builder Row', 'Springfield', 'IL', '62712', 'Builder Referral', 450000, 650000, 3, 2, 'active', 'Wants new construction, energy efficient', 12),
  
  -- Senior citizen, accessibility needs
  ('Frank', 'Roberts', 'frank.roberts@email.com', '555-2013', '741 Senior Way', 'Springfield', 'IL', '62713', 'Healthcare Referral', 200000, 350000, 2, 1, 'lead', 'Accessibility needs, single level preferred', 6),
  
  -- Out-of-state buyer, virtual viewing
  ('Patricia', 'Lee', 'patricia.lee@email.com', '555-2014', '963 Remote St', 'Springfield', 'IL', '62714', 'Website', 380000, 520000, 3, 2, 'prospect', 'Out of state, relies on virtual tours', 1),
  
  -- Inherited property, buying replacement
  ('Christopher', 'Brown', 'christopher.brown@email.com', '555-2015', '159 Heritage Ave', 'Springfield', 'IL', '62715', 'Estate Attorney', 600000, 900000, 4, 3, 'lead', 'Selling inherited property, upgrading', 4),
  
  -- Military relocation
  ('Captain', 'Smith', 'captain.smith@military.email', '555-2016', '753 Base Housing', 'Springfield', 'IL', '62716', 'Military Network', 300000, 450000, 3, 2, 'active', 'Military relocation, VA loan qualified', 11),
  
  -- Flip investor, multiple properties
  ('Tony', 'Ricci', 'tony.ricci@email.com', '555-2017', '951 Contractor Dr', 'Springfield', 'IL', '62717', 'Contractor Network', 100000, 800000, NULL, NULL, 'active', 'House flipper, looking for deals', 10),
  
  -- Just browsing, not serious yet
  ('Madison', 'Taylor', 'madison.taylor@email.com', '555-2018', '357 Browser Lane', 'Springfield', 'IL', '62718', 'Website', 250000, 400000, 2, 2, 'lead', 'Just browsing, not pre-approved yet', NULL);

-- Sample Listings (Much more diverse price points and conditions)
INSERT INTO listing (address, city, state, zip_code, listing_price, status, property_type, bedrooms, bathrooms, square_feet, lot_size, year_built, listing_date, days_on_market, listing_agent_id, description, features) VALUES
  -- Luxury properties
  ('1001 Mansion Row', 'Springfield', 'IL', '62701', 2850000, 'active', 'Single Family', 6, 5.5, 6800, 2.5, 2023, '2024-01-05', 17, 7, 'Ultra-luxury estate with every amenity', ARRAY['Wine Cellar', 'Home Theater', 'Pool', 'Guest House', 'Elevator', 'Smart Home']),
  ('2002 Executive Blvd', 'Springfield', 'IL', '62702', 1650000, 'active', 'Single Family', 5, 4, 4200, 1.2, 2022, '2024-01-08', 14, 7, 'Modern executive home with city views', ARRAY['Chef Kitchen', 'Office', 'Gym', 'Pool', 'Security System']),
  ('3003 Prestige Way', 'Springfield', 'IL', '62703', 1200000, 'pending', 'Single Family', 4, 3.5, 3800, 0.8, 2021, '2023-12-20', 33, 7, 'Contemporary luxury with premium finishes', ARRAY['Gourmet Kitchen', 'Master Suite', 'Pool', 'Workshop']),
  
  -- Mid-range family homes
  ('4004 Family Street', 'Springfield', 'IL', '62704', 485000, 'active', 'Single Family', 4, 3, 2400, 0.4, 2018, '2024-01-10', 12, 2, 'Perfect family home in great school district', ARRAY['Updated Kitchen', 'Fenced Yard', 'Garage', 'Basement']),
  ('5005 Suburban Dr', 'Springfield', 'IL', '62705', 425000, 'active', 'Single Family', 3, 2.5, 2100, 0.35, 2017, '2024-01-12', 10, 3, 'Move-in ready with recent updates', ARRAY['Hardwood Floors', 'New HVAC', 'Deck', 'Storage']),
  ('6006 School Zone Ave', 'Springfield', 'IL', '62706', 535000, 'contingent', 'Single Family', 4, 3, 2600, 0.5, 2019, '2023-12-28', 25, 1, 'Excellent schools, family neighborhood', ARRAY['Open Floor Plan', 'Two Car Garage', 'Patio', 'Pantry']),
  
  -- Starter homes and condos
  ('7007 First Home Lane', 'Springfield', 'IL', '62707', 225000, 'active', 'Townhouse', 2, 2, 1400, 0.05, 2020, '2024-01-15', 7, 9, 'Perfect starter home with low maintenance', ARRAY['HOA Amenities', 'Patio', 'In-Unit Laundry', 'Storage']),
  ('8008 Condo Circle', 'Springfield', 'IL', '62708', 185000, 'active', 'Condo', 2, 1, 950, 0, 2019, '2024-01-14', 8, 9, 'Affordable condo with city convenience', ARRAY['Balcony', 'Gym Access', 'Pool', 'Parking']),
  ('9009 Budget Way', 'Springfield', 'IL', '62709', 165000, 'active', 'Single Family', 2, 1, 900, 0.1, 1985, '2024-01-18', 4, 9, 'Fixer-upper with great potential', ARRAY['Large Lot', 'Garage', 'Original Hardwood']),
  
  -- Investment properties
  ('1010 Rental Row', 'Springfield', 'IL', '62710', 145000, 'active', 'Single Family', 3, 1, 1100, 0.15, 1978, '2024-01-11', 11, 10, 'Great rental investment opportunity', ARRAY['Separate Entrance', 'Parking', 'Storage Shed']),
  ('1111 Cash Flow St', 'Springfield', 'IL', '62711', 195000, 'active', 'Duplex', 4, 2, 1800, 0.2, 1995, '2024-01-09', 13, 10, 'Duplex with excellent rental potential', ARRAY['Two Units', 'Separate Utilities', 'Parking', 'Yard']),
  ('1212 Portfolio Ave', 'Springfield', 'IL', '62712', 320000, 'sold', 'Fourplex', 8, 4, 3200, 0.3, 1990, '2023-11-15', 68, 10, 'Multi-unit investment property', ARRAY['Four Units', 'Laundry Facility', 'Parking Lot']),
  
  -- Unique properties
  ('1313 Historic Main', 'Springfield', 'IL', '62713', 750000, 'active', 'Historic', 4, 3, 3200, 0.4, 1895, '2024-01-06', 16, 4, 'Beautifully restored Victorian mansion', ARRAY['Historic Details', 'Period Features', 'Carriage House', 'Gardens']),
  ('1414 New Build Circle', 'Springfield', 'IL', '62714', 465000, 'active', 'Single Family', 3, 2.5, 2200, 0.3, 2024, '2024-01-20', 2, 12, 'Brand new construction with warranties', ARRAY['Energy Efficient', 'Smart Home', 'Granite Counters', 'Warranty']),
  ('1515 Senior Village', 'Springfield', 'IL', '62715', 285000, 'active', 'Single Family', 2, 2, 1600, 0.1, 2016, '2024-01-13', 9, 6, 'Single level living in 55+ community', ARRAY['No Steps', 'Community Center', 'Golf Cart Friendly', 'Low Maintenance']),
  
  -- Problem properties
  ('1616 Foreclosure Way', 'Springfield', 'IL', '62716', 125000, 'active', 'Single Family', 3, 1, 1200, 0.2, 1975, '2024-01-17', 5, 10, 'Bank owned, sold as-is condition', ARRAY['Needs Work', 'Cash Only', 'Large Lot', 'Structural Issues']),
  ('1717 Estate Sale Dr', 'Springfield', 'IL', '62717', 395000, 'pending', 'Single Family', 4, 2, 2400, 0.6, 1962, '2023-12-22', 31, 4, 'Estate sale, needs updating but solid bones', ARRAY['Large Lot', 'Original Details', 'Needs Updates', 'Privacy']),
  
  -- Commercial properties
  ('1818 Business Blvd', 'Springfield', 'IL', '62718', 850000, 'active', 'Commercial', 0, 2, 4500, 0.5, 2005, '2024-01-07', 15, 8, 'Prime commercial space with parking', ARRAY['High Traffic', 'Parking Lot', 'Multiple Units', 'Investment Grade']),
  ('1919 Office Park', 'Springfield', 'IL', '62719', 1250000, 'active', 'Commercial', 0, 4, 8500, 1.0, 2010, '2024-01-04', 18, 8, 'Professional office building', ARRAY['Class A Space', 'Elevator', 'Conference Rooms', 'Parking Garage']),
  
  -- Vacation/Second homes
  ('2020 Lake View Dr', 'Springfield', 'IL', '62720', 675000, 'active', 'Single Family', 3, 3, 2200, 1.5, 2015, '2024-01-16', 6, 7, 'Waterfront retreat with dock access', ARRAY['Lake Access', 'Dock', 'Fire Pit', 'Boat Storage']);

-- Sample Opportunities (Complex, realistic scenarios)
INSERT INTO opportunity (customer_id, listing_id, stage, offer_amount, closing_date, sale_price, commission_total, financing_type, inspection_completed, appraisal_completed, contract_signed_date, probability, notes) VALUES
  -- Marcus Thompson (investor) - Multiple properties
  (1, 10, 'closed', 140000, '2024-01-20', 140000, 4200, 'Cash', true, true, '2024-01-05', 100, 'Quick cash deal, first of several'),
  (1, 11, 'under_contract', 190000, '2024-02-28', NULL, NULL, 'Cash', true, false, '2024-01-25', 90, 'Second property for portfolio'),
  (1, 12, 'closed', 320000, '2024-01-15', 320000, 8000, 'Commercial', true, true, '2023-12-01', 100, 'Multi-unit investment property'),
  (1, 16, 'negotiating', 115000, NULL, NULL, NULL, 'Cash', false, false, NULL, 70, 'Foreclosure property, needs work'),
  
  -- Victoria Sterling (luxury buyer) - High-end properties
  (2, 1, 'showing', NULL, NULL, NULL, NULL, 'Cash', false, false, NULL, 30, 'Interested in ultra-luxury, second showing scheduled'),
  (2, 2, 'negotiating', 1550000, NULL, NULL, NULL, 'Jumbo', false, false, NULL, 60, 'Serious about executive home, price negotiation'),
  (2, 20, 'lead', NULL, NULL, NULL, NULL, 'Cash', false, false, NULL, 25, 'Considering waterfront as second home'),
  
  -- Alex Rivera (first-time buyer) - Starter homes
  (3, 7, 'under_contract', 220000, '2024-03-15', NULL, NULL, 'FHA', true, true, '2024-02-01', 95, 'First-time buyer, FHA approved'),
  (3, 8, 'lost', 180000, NULL, NULL, NULL, 'FHA', false, false, NULL, 0, 'Lost to higher offer, over budget'),
  
  -- Jennifer Chang (corporate relocation) - Urgent timeline
  (4, 4, 'closed', 475000, '2024-01-30', 475000, 14250, 'Corporate', true, true, '2024-01-10', 100, 'Corporate relocation, fast closing'),
  (4, 6, 'lost', 520000, NULL, NULL, NULL, 'Corporate', false, false, NULL, 0, 'Backup offer, chose another property'),
  
  -- Robert Wilson (downsizing) - Taking time
  (5, 15, 'showing', NULL, NULL, NULL, NULL, 'Conventional', false, false, NULL, 40, 'Senior community showing, needs time to decide'),
  
  -- Emma Foster (young professionals) - Modern preferences
  (6, 5, 'contingent', 415000, '2024-03-20', NULL, NULL, 'Conventional', false, false, '2024-02-05', 75, 'Contingent on selling current home'),
  (6, 14, 'showing', NULL, NULL, NULL, NULL, 'Conventional', false, false, NULL, 50, 'New construction showing, likes modern features'),
  
  -- Hiroshi Tanaka (international buyer) - Cash deals
  (7, 3, 'under_contract', 1150000, '2024-02-15', NULL, NULL, 'Cash', true, false, '2024-01-28', 85, 'International cash buyer, some documentation delays'),
  (7, 13, 'showing', NULL, NULL, NULL, NULL, 'Cash', false, false, NULL, 35, 'Considering historic property as investment'),
  
  -- Sarah Johnson (growing family) - School district focus
  (8, 6, 'negotiating', 510000, NULL, NULL, NULL, 'Conventional', false, false, NULL, 65, 'Perfect school district, negotiating price'),
  
  -- Michael Peters (divorce situation) - Urgent
  (9, 9, 'closed', 160000, '2024-01-25', 160000, 4800, 'Conventional', false, true, '2024-01-12', 100, 'Divorce settlement, quick closing needed'),
  
  -- Linda Martinez (empty nesters) - Luxury condo
  (10, NULL, 'lead', NULL, NULL, NULL, NULL, NULL, false, false, NULL, 30, 'Looking for luxury condo, no specific property yet'),
  
  -- David Kumar (investment group) - Multiple deals
  (11, 11, 'showing', NULL, NULL, NULL, NULL, 'Commercial', false, false, NULL, 45, 'Investment group evaluation'),
  (11, 18, 'under_contract', 820000, '2024-03-01', NULL, NULL, 'Commercial', true, false, '2024-02-10', 80, 'Commercial investment property'),
  
  -- Ashley Clark - New construction
  (12, 14, 'under_contract', 455000, '2024-04-15', NULL, NULL, 'Conventional', false, false, '2024-02-15', 90, 'New construction, waiting for completion'),
  
  -- Frank Roberts (accessibility needs)
  (13, 15, 'showing', NULL, NULL, NULL, NULL, 'Conventional', false, false, NULL, 55, 'Senior community fits accessibility needs'),
  
  -- Patricia Lee (out-of-state) - Virtual process
  (14, 5, 'negotiating', 405000, NULL, NULL, NULL, 'Conventional', false, false, NULL, 50, 'Out of state buyer, virtual negotiations'),
  
  -- Christopher Brown (inherited property)
  (15, 17, 'contingent', 380000, '2024-03-30', NULL, NULL, 'Conventional', false, false, '2024-02-20', 70, 'Contingent on selling inherited property'),
  
  -- Captain Smith (military relocation)
  (16, 4, 'lost', 460000, NULL, NULL, NULL, 'VA', false, false, NULL, 0, 'Lost to civilian buyer, house sold'),
  (16, 5, 'showing', NULL, NULL, NULL, NULL, 'VA', false, false, NULL, 60, 'Second choice, good for military family'),
  
  -- Tony Ricci (flipper) - Multiple cheap properties
  (17, 9, 'closed', 155000, '2024-02-01', 155000, 4650, 'Cash', false, false, '2024-01-20', 100, 'Flip investment, cash purchase'),
  (17, 16, 'negotiating', 110000, NULL, NULL, NULL, 'Cash', false, false, NULL, 80, 'Another flip opportunity'),
  
  -- More opportunities for variety and edge cases
  (1, 17, 'showing', NULL, NULL, NULL, NULL, 'Cash', false, false, NULL, 35, 'Looking at estate property for flip'),
  (2, 3, 'lost', 1100000, NULL, NULL, NULL, 'Cash', false, false, NULL, 0, 'Changed mind after inspection'),
  (11, 10, 'closed', 145000, '2024-02-05', 145000, 4350, 'Cash', true, true, '2024-01-18', 100, 'Investment group rental property'),
  (17, 8, 'negotiating', 175000, NULL, NULL, NULL, 'Cash', false, false, NULL, 75, 'Considering condo for flip'),
  (5, NULL, 'lead', NULL, NULL, NULL, NULL, NULL, false, false, NULL, 25, 'Still looking for right senior community'),
  (14, 6, 'showing', NULL, NULL, NULL, NULL, 'Conventional', false, false, NULL, 45, 'Virtual showing of school district home'),
  
  -- Opportunities without assigned customers (walk-ins, etc.)
  (NULL, 19, 'lead', NULL, NULL, NULL, NULL, NULL, false, false, NULL, 20, 'Commercial inquiry, no assigned customer yet'),
  (NULL, 13, 'showing', NULL, NULL, NULL, NULL, 'Cash', false, false, NULL, 15, 'Walk-in interested in historic property');
  
  -- Some customers with no opportunities yet (Madison Taylor - just browsing)

-- Sample Commission Splits (Complex scenarios with various splits)
INSERT INTO rep_link (rep_id, opportunity_id, role, commission_percentage, commission_amount, paid_date) VALUES
  -- Marcus Thompson deals (opportunities 1-4)
  (10, 1, 'Listing Agent', 50.0, 2100, '2024-01-25'),
  (10, 1, 'Buyer Agent', 50.0, 2100, '2024-01-25'),
  (10, 2, 'Buyer Agent', 60.0, NULL, NULL),
  (3, 2, 'Listing Agent', 40.0, NULL, NULL),
  (10, 3, 'Listing Agent', 100.0, 8000, '2024-01-20'),
  (10, 4, 'Buyer Agent', 70.0, NULL, NULL),
  (2, 4, 'Listing Agent', 35.0, NULL, NULL), -- OVER 100% example (105%)
  
  -- Victoria Sterling deals (opportunities 5-7)
  (7, 5, 'Listing Agent', 30.0, NULL, NULL),
  (7, 6, 'Listing Agent', 50.0, NULL, NULL),
  (7, 6, 'Buyer Agent', 50.0, NULL, NULL),
  (7, 7, 'Showing Agent', 25.0, NULL, NULL),
  
  -- Alex Rivera deals (opportunities 8-9)
  (9, 8, 'Buyer Agent', 60.0, NULL, NULL),
  (6, 8, 'Listing Agent', 40.0, NULL, NULL),
  (9, 9, 'Buyer Agent', 50.0, NULL, NULL), -- Lost deal, no commission
  
  -- Jennifer Chang deals (opportunities 10-11)
  (11, 10, 'Buyer Agent', 50.0, 7125, '2024-02-05'),
  (2, 10, 'Listing Agent', 40.0, 5700, '2024-02-05'),
  (5, 10, 'Referral Fee', 15.0, 2137.50, '2024-02-05'), -- OVER 100% total (105%)
  (11, 11, 'Buyer Agent', 50.0, NULL, NULL), -- Lost deal
  
  -- Robert Wilson (opportunity 12)
  (6, 12, 'Listing Agent', 100.0, NULL, NULL),
  
  -- Emma Foster deals (opportunities 13-14)
  (2, 13, 'Buyer Agent', 50.0, NULL, NULL),
  (3, 13, 'Listing Agent', 50.0, NULL, NULL),
  (12, 14, 'Showing Agent', 25.0, NULL, NULL),
  
  -- Hiroshi Tanaka deals (opportunities 15-16)
  (7, 15, 'Buyer Agent', 60.0, NULL, NULL),
  (7, 15, 'Listing Agent', 40.0, NULL, NULL),
  (7, 16, 'Showing Agent', 30.0, NULL, NULL),
  
  -- Sarah Johnson (opportunity 17)
  (3, 17, 'Buyer Agent', 55.0, NULL, NULL),
  (1, 17, 'Listing Agent', 45.0, NULL, NULL),
  
  -- Michael Peters (opportunity 18) - reduced commission
  (1, 18, 'Buyer Agent', 40.0, 1920, '2024-01-30'),
  (9, 18, 'Listing Agent', 35.0, 1680, '2024-01-30'), -- UNDER 100% total (75%)
  
  -- David Kumar deals (opportunities 20-21)
  (10, 20, 'Showing Agent', 25.0, NULL, NULL),
  (8, 21, 'Buyer Agent', 30.0, NULL, NULL),
  (8, 21, 'Listing Agent', 70.0, NULL, NULL), -- Commercial specialist gets more
  
  -- Ashley Clark (opportunity 22) - New construction
  (12, 22, 'Buyer Agent', 50.0, NULL, NULL),
  (12, 22, 'Builder Bonus', 15.0, NULL, NULL), -- OVER 100% with builder bonus (65%)
  
  -- Frank Roberts (opportunity 23)
  (6, 23, 'Listing Agent', 100.0, NULL, NULL),
  
  -- Patricia Lee (opportunity 24)
  (1, 24, 'Buyer Agent', 55.0, NULL, NULL),
  (3, 24, 'Listing Agent', 45.0, NULL, NULL),
  
  -- Christopher Brown (opportunity 25)
  (4, 25, 'Buyer Agent', 50.0, NULL, NULL),
  (4, 25, 'Estate Specialist', 25.0, NULL, NULL), -- OVER 100% with specialty fee (75%)
  
  -- Captain Smith deals (opportunities 26-27)
  (11, 26, 'Buyer Agent', 50.0, NULL, NULL), -- Lost deal
  (11, 27, 'Buyer Agent', 60.0, NULL, NULL),
  (3, 27, 'Listing Agent', 40.0, NULL, NULL),
  
  -- Tony Ricci deals (opportunities 28-29)
  (10, 28, 'Dual Agent', 80.0, 3720, '2024-02-05'), -- Dual representation, UNDER 100% (80%)
  (10, 29, 'Buyer Agent', 70.0, NULL, NULL),
  (9, 29, 'Listing Agent', 30.0, NULL, NULL),
  
  -- Additional deals (opportunities 30-35)
  (10, 30, 'Buyer Agent', 45.0, NULL, NULL),
  (4, 30, 'Listing Agent', 55.0, NULL, NULL),
  (7, 31, 'Buyer Agent', 30.0, NULL, NULL), -- Lost deal
  (10, 32, 'Buyer Agent', 60.0, 2610, '2024-02-10'),
  (10, 32, 'Listing Agent', 40.0, 1740, '2024-02-10'),
  (10, 33, 'Buyer Agent', 65.0, NULL, NULL),
  (9, 33, 'Listing Agent', 35.0, NULL, NULL),
  (1, 35, 'Buyer Agent', 50.0, NULL, NULL),
  (1, 35, 'Listing Agent', 50.0, NULL, NULL), -- Dual agent scenario
  
  -- High-earning rep scenarios for reporting
  (7, 5, 'Luxury Bonus', 12.0, NULL, NULL), -- James Wilson luxury bonus
  (7, 6, 'High-Value Deal Bonus', 8.0, NULL, NULL), -- Additional luxury bonuses
  (10, 1, 'Investment Volume Bonus', 3.0, 126, '2024-01-25'), -- Rachel Davis volume bonus
  (10, 3, 'Portfolio Bonus', 5.0, 400, '2024-01-20'), -- Portfolio management bonus
  (10, 32, 'Investment Specialist', 10.0, 435, '2024-02-10'); -- Investment specialist fee