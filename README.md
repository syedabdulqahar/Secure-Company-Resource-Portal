# CS3723 Database Security — RBAC + ABAC Portal

A full-stack web application that demonstrates **Role-Based Access Control (RBAC)** and **Attribute-Based Access Control (ABAC)** for protecting company resources. Users authenticate with JWT, access is enforced on the server, every significant action is written to an audit log, and built-in attack simulations validate common security controls.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Database Design](#database-design)
6. [Security Model](#security-model)
7. [How It Works (End-to-End)](#how-it-works-end-to-end)
8. [Backend API](#backend-api)
9. [Frontend Application](#frontend-application)
10. [Attack Simulations](#attack-simulations)
11. [Setup & Running](#setup--running)
12. [Demo Accounts](#demo-accounts)
13. [Key Files Reference](#key-files-reference)

---

## Overview

This project models a **secure company portal** where employees, managers, administrators, and auditors interact with sensitive resources (documents, server configs, financial data). Access is not granted by role alone — it also depends on **user and resource attributes** such as department, clearance level, location, and time of day.

| Layer        | Purpose |
|-------------|---------|
| **Frontend** | React SPA for login, resource management, user admin, dashboards, audit logs, and attack tests |
| **Backend**  | Express REST API with JWT auth, RBAC/ABAC engine, input validation, and audit logging |
| **Database** | PostgreSQL storing users, roles, permissions, resources, ABAC policies, and audit logs |

---

## Architecture

```mermaid
flowchart TB
    subgraph Client["Browser (React + Vite)"]
        UI[Components / App.jsx]
        State[React State + fetch API]
    end

    subgraph Server["Node.js + Express"]
        Routes[REST Routes]
        AuthMW[JWT authenticate]
        SQLi[SQL Injection Filter]
        BruteForce[Login Rate Limiter]
        AuthZ[authorization.js<br/>RBAC + ABAC Engine]
        Audit[Audit Logger]
    end

    subgraph DB["PostgreSQL"]
        Users[(users)]
        Roles[(roles / permissions)]
        Resources[(resources)]
        Policies[(policies)]
        Logs[(audit_logs)]
    end

    UI --> State
    State -->|Bearer JWT| Routes
    Routes --> SQLi
    Routes --> AuthMW
    Routes --> BruteForce
    AuthMW --> AuthZ
    AuthZ --> Users
    AuthZ --> Roles
    AuthZ --> Resources
    AuthZ --> Policies
    Routes --> Audit
    Audit --> Logs
```

**Request flow (simplified):**

1. User logs in → backend verifies credentials → returns JWT (8-hour expiry).
2. Frontend stores token in React state and sends it on every API call.
3. `authenticate` middleware verifies the JWT and reloads the user from the database.
4. Route handlers check **RBAC** (does the role have READ/WRITE/UPDATE/DELETE?) and **ABAC** (do attribute policies allow this user + resource?).
5. Allowed or denied actions are recorded in `audit_logs`.

---

## Tech Stack

| Part | Technologies |
|------|-------------|
| **Frontend** | React 19, Vite 8, plain CSS, native `fetch` |
| **Backend** | Node.js, Express 4, CORS, dotenv |
| **Database** | PostgreSQL via `pg` |
| **Authentication** | bcrypt (12 rounds), JSON Web Tokens (`jsonwebtoken`) |
| **Authorization** | Custom RBAC + ABAC engine in `backend/src/authorization.js` |

There is no React Router, Redux, or axios — the app is intentionally small and suitable for a course project.

---

## Project Structure

```
Project/
├── README.md                 ← this file
├── backend/
│   ├── db_schema.sql         # PostgreSQL table definitions
│   ├── .env.example          # Environment variable template
│   ├── package.json
│   └── src/
│       ├── server.js         # Express app, all routes, middleware
│       ├── auth.js           # Password hashing + JWT helpers
│       ├── authorization.js  # RBAC + ABAC evaluation engine
│       ├── db.js             # PostgreSQL connection pool
│       ├── migrate.js        # Runs db_schema.sql
│       └── seed.js           # Inserts roles, users, policies, resources
└── frontend/
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx          # React entry point
        ├── App.jsx           # Main app: state, API client, tab routing
        ├── App.css           # Application styles
        ├── constants.js      # API URL and form defaults
        └── components/
            ├── LoginScreen.jsx
            ├── AppHeader.jsx
            ├── TabNav.jsx
            ├── MessageBanner.jsx
            ├── DashboardTab.jsx
            ├── ResourcesTab.jsx
            ├── UsersTab.jsx
            ├── RolesTab.jsx
            ├── AuditLogsTab.jsx
            ├── AttacksTab.jsx
            └── ui/
                ├── DataTable.jsx
                ├── Bar.jsx
                └── Metric.jsx
```

---

## Database Design

Schema file: `backend/db_schema.sql`

### Entity Relationship

```
roles ──< users
roles ──< role_permissions >── permissions

resources          (standalone protected objects)
policies           (ABAC rules)
audit_logs         (references user_id, resource_id — not FK-constrained)
```

### Tables

| Table | Description |
|-------|-------------|
| `roles` | Admin, Manager, Employee, Auditor |
| `permissions` | READ, WRITE, UPDATE, DELETE |
| `role_permissions` | Maps which permissions each role has |
| `users` | Account info: email, hashed password, department, clearance, location, role |
| `resources` | Protected items with department and classification (1–5) |
| `policies` | ABAC rules: attribute, operator, value, action (ALLOW/DENY) |
| `audit_logs` | Timestamped access events with decision, reason, and IP |

### Seeded Data (`backend/src/seed.js`)

**Role → Permission matrix**

| Role | Permissions |
|------|-------------|
| Admin | READ, WRITE, UPDATE, DELETE |
| Manager | READ, WRITE, UPDATE |
| Employee | READ |
| Auditor | READ |

**Sample resources**

| Resource | Department | Classification |
|----------|------------|----------------|
| IT Server Configuration | IT | 3 |
| HR Policy Document | HR | 2 |
| Finance Forecast | Finance | 4 |
| Employee Handbook | HR | 1 |

**ABAC policies**

| Attribute | Operator | Value | Action |
|-----------|----------|-------|--------|
| `department` | `=` | `resource_department` | ALLOW |
| `clearance_level` | `>=` | `resource_classification` | ALLOW |
| `location` | `=` | `Office` | ALLOW |
| `location` | `!=` | `Remote` | DENY |
| `time` | `BETWEEN` | `08:00-18:00` | ALLOW |

Policy values like `resource_department` and `resource_classification` are resolved dynamically from the target resource at evaluation time.

---

## Security Model

Access control uses two layers that must both pass (except where noted).

### 1. RBAC — Role-Based Access Control

Each user has one role. Roles are linked to permissions through `role_permissions`.

- **READ** — view resources
- **WRITE** — create resources
- **UPDATE** — modify resources
- **DELETE** — remove resources

Example: an Employee has READ only; they cannot create or delete resources even if ABAC would allow it.

Implementation: `userHasPermission()` in `backend/src/authorization.js`

### 2. ABAC — Attribute-Based Access Control

Even with the right RBAC permission, access to a **specific resource** depends on policies stored in the `policies` table.

**Evaluation order** (`evaluateABAC`):

1. **Admin bypass** — Admin users skip ABAC entirely (full access).
2. **DENY policies** — if any DENY policy matches → access denied.
3. **ALLOW policies** — **all** ALLOW policies must match → access granted.

**Supported attributes:** `time`, `department`, `clearance_level`, `location`, `resource_department`, `resource_classification`

**Supported operators:** `=`, `!=`, `>=`, `<=`, `>`, `<`, `BETWEEN`

**Full resource check** (`canAccessResource`):

1. Reject if resource does not exist.
2. **Auditors are always denied** resource access (they can view logs but not data).
3. Check RBAC permission for the requested action.
4. Run ABAC evaluation.

### 3. Additional Security Controls

| Control | Location | Behavior |
|---------|----------|----------|
| **Password hashing** | `auth.js` | bcrypt, 12 salt rounds |
| **JWT auth** | `auth.js`, `server.js` | 8-hour tokens; user reloaded from DB on each request |
| **SQL injection filter** | `server.js` | Rejects suspicious patterns in body/query before DB access |
| **Brute-force protection** | `server.js` | Max 5 failed logins per IP+email in 15 minutes → HTTP 429 |
| **Audit logging** | `authorization.js` | LOGIN, READ, WRITE, UPDATE, DELETE, admin actions, simulations |
| **Parameterized queries** | throughout | All SQL uses `$1, $2, ...` placeholders via `pg` |

### Role Behavior Summary

| Role | Portal tabs | Resource access | Admin features |
|------|-------------|-----------------|----------------|
| **Admin** | All | Full (ABAC bypass) | User CRUD, policies, delete resources |
| **Auditor** | Dashboard, Resources*, Logs, Attacks | *List always empty — no resource access | None |
| **Manager** | Resources | ABAC-filtered; can create resources | None |
| **Employee** | Resources | ABAC-filtered; read-only | None |

---

## How It Works (End-to-End)

### Login flow

```
User → POST /auth/login { email, password }
     → SQL injection check
     → Rate limit check (IP + email)
     → Fetch user from DB
     → bcrypt.compare(password, hash)
     → Write audit log (ALLOW or DENY)
     → Return { token, user }
     → Frontend sets active tab (Dashboard for Admin/Auditor, Resources for others)
```

The JWT is stored in React state only — **refreshing the page logs the user out**.

### Resource access example

**Scenario:** HR Employee (`employee@company.com`) tries to read **Finance Forecast** (Finance, classification 4).

| Check | Result |
|-------|--------|
| RBAC: Employee has READ? | ✓ Yes |
| ABAC: department = resource_department? | ✗ HR ≠ Finance |
| ABAC: clearance_level >= classification? | ✗ 2 < 4 |
| **Final decision** | **DENY** — resource hidden from list |

If the user calls `GET /resources/:id` directly, the server returns **403 Forbidden** and logs the attempt.

### Authenticated request flow

```
Frontend fetch(path, { headers: { Authorization: "Bearer <token>" } })
  → authenticate middleware verifies JWT
  → User + role loaded from PostgreSQL into req.user
  → Route handler applies role/permission checks
  → ABAC engine evaluates policies (if applicable)
  → Response returned + audit entry written
```

---

## Backend API

Base URL: `http://localhost:3000` (configurable via `PORT`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | None | Health check |
| POST | `/auth/login` | None | Login; returns JWT + user profile |
| GET | `/roles` | JWT | List roles with permissions |
| GET | `/resources` | JWT | Resources filtered by RBAC + ABAC |
| GET | `/resources/:id` | JWT | Single resource; 403 if denied |
| POST | `/resources` | JWT | Create resource (WRITE + ABAC) |
| PUT | `/resources/:id` | JWT | Update resource (UPDATE + ABAC) |
| DELETE | `/resources/:id` | JWT | Delete resource (DELETE + ABAC) |
| GET | `/users` | JWT + Admin | List all users |
| POST | `/users` | JWT + Admin | Create user |
| PUT | `/users/:id` | JWT + Admin | Update user (e.g. change role) |
| DELETE | `/users/:id` | JWT + Admin | Delete user (cannot delete self) |
| GET | `/audit-logs` | JWT + Admin/Auditor | Audit log with optional filters |
| GET | `/dashboard` | JWT + Admin/Auditor | Metrics and charts |
| GET | `/policies` | JWT + Admin | List ABAC policies |
| GET | `/attack-simulations` | JWT + Admin/Auditor | Run security test scenarios |

**Audit log query parameters:** `user_id`, `resource_id`, `decision`, `search`

---

## Frontend Application

Entry: `frontend/src/main.jsx` → `App.jsx`

### State management

All application state lives in `App.jsx` using React hooks (`useState`, `useMemo`, `useEffect`). There is no global store or persisted session.

**Main state groups:**
- **Auth:** `user`, `token`, login form fields
- **Data:** `resources`, `users`, `roles`, `policies`, `logs`, `dashboard`, `simulations`
- **UI:** `activeTab`, `error`, `notice`, `loading`

### API client

`App.jsx` defines an `api(path, options)` helper that:
- Prefixes requests with `VITE_API_URL` (default `http://localhost:3000`)
- Sends `Authorization: Bearer <token>` when logged in
- Parses JSON and throws on HTTP errors

### Component layout

| Component | Responsibility |
|-----------|----------------|
| `LoginScreen` | Login form and sample account hints |
| `AppHeader` | Logged-in user info and logout button |
| `TabNav` | Role-filtered navigation tabs |
| `MessageBanner` | Error and success messages |
| `DashboardTab` | Metrics cards and bar charts |
| `ResourcesTab` | Resource table, create form, delete (Admin) |
| `UsersTab` | Create users, role assignment, delete (Admin) |
| `RolesTab` | Role-permission matrix and ABAC policy table |
| `AuditLogsTab` | Filterable audit log viewer |
| `AttacksTab` | Trigger and display attack simulation results |
| `ui/Metric`, `ui/Bar`, `ui/DataTable` | Reusable display components |

### Tab visibility by role

| Tab | Admin | Auditor | Manager | Employee |
|-----|-------|---------|---------|----------|
| Dashboard | ✓ | ✓ | | |
| Resources | ✓ | ✓* | ✓ | ✓ |
| Users | ✓ | | | |
| Roles | ✓ | | | |
| Audit Logs | ✓ | ✓ | | |
| Attack Tests | ✓ | ✓ | | |

\*Auditor sees the Resources tab but the backend returns an empty list.

---

## Attack Simulations

Available from the **Attack Tests** tab (Admin and Auditor only).

Endpoint: `GET /attack-simulations`

| Test | What it validates | How |
|------|-------------------|-----|
| **Privilege Escalation** | Employees cannot access admin endpoints | Documented expected 403 behavior |
| **Unauthorized Resource** | ABAC blocks cross-department access | Live check: HR Employee → Finance resource |
| **SQL Injection** | Malicious login input is blocked | Documents `rejectSqlInjection` middleware |
| **JWT Token Tampering** | Invalid tokens are rejected | Live test with `"invalid.tampered.token"` |

Each run writes simulated events to `audit_logs` (e.g. `SIM_UNAUTHORIZED_RESOURCE`, `SIM_SQL_INJECTION`).

---

## Setup & Running

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [PostgreSQL](https://www.postgresql.org/) with a database named `employee_db`

### 1. Database

Create the database in PostgreSQL:

```sql
CREATE DATABASE employee_db;
```

### 2. Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgres://postgres:postgres@localhost:5432/employee_db` |
| `JWT_SECRET` | Secret key for signing JWTs (use a long random string in production) |
| `PORT` | Optional; defaults to `3000` |

Install, migrate, and start:

```bash
npm install
npm run migrate    # creates tables + seeds data
npm start          # or: npm run dev (nodemon)
```

Verify: `GET http://localhost:3000/health`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev        # Vite dev server — default http://localhost:5173
```

Optional: create `frontend/.env` if the API is not on port 3000:

```
VITE_API_URL=http://localhost:3000
```

### 4. Production build

```bash
cd frontend
npm run build      # output in frontend/dist/
```

---

## Demo Accounts

All passwords are seeded by `backend/src/seed.js`:

| Email | Password | Role | Department | Clearance |
|-------|----------|------|------------|-----------|
| admin@company.com | Admin123! | Admin | IT | 5 |
| manager@company.com | Manager123! | Manager | IT | 4 |
| employee@company.com | Employee123! | Employee | HR | 2 |
| auditor@company.com | Auditor123! | Auditor | IT | 5 |

**Suggested demo flow:**

1. Log in as **employee@company.com** — see only HR resources you are allowed to read.
2. Log in as **manager@company.com** — see IT resources; can create new ones.
3. Log in as **admin@company.com** — full access, user management, policies, attack tests.
4. Log in as **auditor@company.com** — dashboard and audit logs, but no resource data.

---

## Key Files Reference

| Concern | File |
|---------|------|
| All API routes & middleware | `backend/src/server.js` |
| JWT & password utilities | `backend/src/auth.js` |
| RBAC + ABAC engine | `backend/src/authorization.js` |
| Database connection | `backend/src/db.js` |
| Schema DDL | `backend/db_schema.sql` |
| Seed data | `backend/src/seed.js` |
| Migration runner | `backend/src/migrate.js` |
| Frontend state & API | `frontend/src/App.jsx` |
| API base URL | `frontend/src/constants.js` |

---

## Course Context

This project was built for **CS3723 Database Security** to demonstrate:

- Secure authentication (hashed passwords, JWT, session-less API design)
- Layered authorization (RBAC for actions, ABAC for fine-grained resource access)
- Database-backed audit trails
- Common attack mitigations (SQL injection filtering, brute-force throttling, token validation)
- A practical admin portal for managing users, roles, policies, and resources

For backend-only setup details, see also `backend/README.md`.
