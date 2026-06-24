-- RBAC + ABAC Access Control System Database Schema

-- Roles table
-- Yahan system ke roles store honge (Admin, Manager, Employee)

CREATE TABLE IF NOT EXISTS roles (
  role_id SERIAL PRIMARY KEY,      -- Har role ka unique ID
  role_name TEXT NOT NULL UNIQUE   -- Role ka naam unique hoga
);



-- Permissions table
-- Yahan actions store hongay (Read, Write, Delete)

CREATE TABLE IF NOT EXISTS permissions (
  permission_id SERIAL PRIMARY KEY,           -- Permission ka unique ID
  permission_name TEXT NOT NULL UNIQUE        -- Permission ka naam
);



-- Role aur Permission ke darmiyan relation
-- Kis role ke paas kaunsi permissions hain

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id INT REFERENCES roles(role_id) ON DELETE CASCADE,
  -- Role ID roles table se ayegi

  permission_id INT REFERENCES permissions(permission_id) ON DELETE CASCADE,
  -- Permission ID permissions table se ayegi

  PRIMARY KEY (role_id, permission_id)
  -- Ek role ko aik permission sirf aik dafa assign ho sakti hai
);



-- Users table
-- System ke tamam users yahan store honge

CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,      -- User ka unique ID

  name TEXT,                       -- User ka naam

  email TEXT UNIQUE,               -- User ki unique email

  password_hash TEXT,              -- Password encrypted form mein store hoga

  department TEXT,                 -- User kis department se belong karta hai
                                   -- Example: IT, HR, Finance

  clearance_level INT,             -- User ka security level
                                   -- Example: 1 = Low, 5 = Medium, 10 = High

  location TEXT,                   -- User ki location ya office

  role_id INT REFERENCES roles(role_id),
  -- User ko assigned role

  status TEXT DEFAULT 'Active'     -- User status (Active / Suspended)
);



-- Resources table
-- Jis data ya files ko protect karna hai

CREATE TABLE IF NOT EXISTS resources (
  resource_id SERIAL PRIMARY KEY,      -- Resource ka unique ID

  resource_name TEXT UNIQUE,           -- Resource ka naam

  department TEXT,                     -- Resource kis department ki hai

  classification INT                   -- Resource ki sensitivity level
                                       -- Example:
                                       -- 1 = Public
                                       -- 5 = Confidential
                                       -- 10 = Top Secret
);



-- Policies table
-- ABAC ke rules yahan save hongay

CREATE TABLE IF NOT EXISTS policies (
  policy_id SERIAL PRIMARY KEY,

  attribute TEXT,      -- Kis attribute par rule lag raha hai
                        -- Example: department

  operator TEXT,       -- Comparison operator
                        -- Example: =, >, >=

  value TEXT,          -- Compare karne wali value
                        -- Example: IT

  action TEXT,         -- Result
                        -- Example: Allow / Deny

  UNIQUE (attribute, operator, value, action)
  -- Duplicate policy save nahi hogi
);



-- Audit Logs table
-- Har access attempt ka record yahan store hoga

CREATE TABLE IF NOT EXISTS audit_logs (

  log_id SERIAL PRIMARY KEY,       -- Log ka unique ID

  user_id INT,                     -- Kis user ne request ki

  resource_id INT,                 -- Kis resource ko access karna tha

  action TEXT,                     -- Read / Write / Delete

  decision TEXT,                   -- Allowed ya Denied

  timestamp TIMESTAMP DEFAULT NOW(),
  -- Request kis waqt hui

  ip_address TEXT,
  -- Request kis IP address se aayi

  reason TEXT
  -- Access allow ya deny hone ki wajah
);



-- Agar reason column pehle se nahi hai
-- to add kar do

ALTER TABLE audit_logs
ADD COLUMN IF NOT EXISTS reason TEXT;

-- Agar status column pehle se nahi hai
-- to add kar do

ALTER TABLE users
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';