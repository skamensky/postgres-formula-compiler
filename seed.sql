-- Migrations will appear here as you chat with AI

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