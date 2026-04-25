# RentFlow KE — Rent Automation Management System

## Quick Start

### Step 1 — Install PostgreSQL and Redis
Make sure PostgreSQL and Redis are running on your machine.

### Step 2 — Setup Backend

```bash
cd rentflow-ke/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Open `.env` and set:
- `DATABASE_URL` — your PostgreSQL connection string
- `JWT_SECRET` — any long random string (min 32 chars)
- `JWT_REFRESH_SECRET` — another long random string

```bash
# Generate Prisma client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init

# Seed with test data
npx ts-node prisma/seed.ts

# Start the API
npx nest start
```

Backend runs at: http://localhost:3001
Swagger docs: http://localhost:3001/api/docs

### Step 3 — Open Frontend

```bash
cd rentflow-ke/frontend
```

Open `index.html` directly in your browser, OR serve it:

```bash
npx serve . -p 3000
```

Go to: http://localhost:3000

---

## Test Login Accounts (after seeding)

| Role       | Email                            | Password         |
|------------|----------------------------------|-----------------|
| Super Admin| admin@rentflow.ke                | SuperAdmin@2024! |
| Landlord   | james.kamau@gmail.com            | Landlord@2024!  |
| Manager    | peter.odhiambo@kamauprops.ke     | Manager@2024!   |
| Tenant     | grace.wanjiku@gmail.com          | Tenant@2024!    |

---

## What's Included

### Backend (NestJS + PostgreSQL + Prisma)
- **Auth** — JWT login, register, refresh tokens, RBAC
- **Landlords** — Multi-tenant isolation, dashboard KPIs
- **Properties** — Full CRUD, per-landlord scoping
- **Units** — Vacancy tracking, unit management
- **Tenants** — Profiles, ledger with running balance
- **Leases** — Lifecycle management, auto account reference generation
- **Billing** — Monthly charge cron (1st of month), late fee engine (daily 8am)
- **Payments** — FIFO allocation engine, manual recording, reversal
- **Webhooks** — M-Pesa Daraja C2B handler with auto-matching
- **Receipts** — Auto-generated after each payment
- **Notifications** — Daily SMS/email reminder scheduler
- **Reports** — Collection summary, arrears, property performance

### Frontend (Single HTML file — no build needed)
- Dashboard with KPIs and collection progress
- Properties management
- Units management
- Tenants + full ledger drill-down
- Leases with account reference display
- Payments recording + unmatched payment queue
- Billing & charges with status filtering
- Receipts list
- Reports (collection, arrears, property performance)
- Notifications log
- Settings + M-Pesa webhook URLs

### Database (15 tables)
landlords, users, properties, units, tenants, leases,
rent_charges, payments, payment_allocations, late_fee_rules,
late_fee_charges, receipts, notifications, unmatched_payments, audit_logs

---

## M-Pesa Integration

Tenants pay to your Paybill using their account reference (e.g. `KAM-KILELESHWA-A1`).

Register these URLs in your Safaricom Business Manager:
- **Validation URL**: `https://your-server.com/api/v1/webhooks/mpesa/validation`
- **Confirmation URL**: `https://your-server.com/api/v1/webhooks/mpesa/confirmation`

Payments auto-match to the correct tenant and generate receipts.

---

## Project Structure

```
rentflow-ke/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma    (database schema)
│   │   └── seed.ts          (test data)
│   ├── src/
│   │   ├── auth/
│   │   ├── landlords/
│   │   ├── properties/
│   │   ├── units/
│   │   ├── tenants/
│   │   ├── leases/
│   │   ├── billing/
│   │   ├── payments/
│   │   ├── webhooks/
│   │   ├── receipts/
│   │   ├── notifications/
│   │   ├── reports/
│   │   └── common/
│   ├── .env.example
│   └── package.json
└── frontend/
    └── index.html           (complete single-file React app)
```
