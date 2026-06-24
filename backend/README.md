Backend setup

1. Copy .env.example to .env and adjust DATABASE_URL and JWT_SECRET.
2. Install dependencies: npm install
3. Run migrations and seed data: npm run migrate
4. Start server: npm start

Endpoints:
- POST /auth/login
- GET /roles
- GET /resources
- GET /resources/:id
- POST /resources
- PUT /resources/:id
- DELETE /resources/:id
- GET /audit-logs
- GET /dashboard
- GET /policies
- GET /users
- POST /users
- PUT /users/:id
- DELETE /users/:id
- GET /attack-simulations

Seeded accounts:
- admin@company.com / Admin123!
- manager@company.com / Manager123!
- employee@company.com / Employee123!
- auditor@company.com / Auditor123!
