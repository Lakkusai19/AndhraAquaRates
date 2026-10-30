# Architecture Overview: Andhra Shrimp Price Hub

## 1. System Mission & Context
The **Andhra Shrimp Price Hub** is a specialized agricultural marketplace platform designed to bring transparency and fair market price discovery to aquaculture farmers across coastal Andhra Pradesh.

### Core Tenet:
- **Public & Free for Farmers:** Farmers can inspect, filter, sort, and contact buyers for real-time purchasing rates without registering, logging in, or paying any fee.
- **Verified Subscriptions for Buyers:** Buyers (exporters, processors, wholesalers) register a verified profile and must maintain an active paid subscription (₹499/month launch price) to publish or update count-wise purchasing prices.
- **Real Database Integrity:** No mock prices or fabricated market metrics in production; price freshness is cryptographically timestamped and calculated via server logic (default 24h threshold).

---

## 2. High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------+
|                                 CLIENT TIER                                     |
|                                                                                 |
|  [ Public Shrimp Farmers ]                      [ Registered Buyers & Admins ]  |
|         |                                                      |                |
|         v                                                      v                |
|  React 18 SPA (TypeScript + Vite + Tailwind CSS + Lucide Icons + TanStack)       |
+---------------------------------------------------------------------------------+
                                       |
                                HTTPS / REST API
                                       |
+---------------------------------------------------------------------------------+
|                                 GATEWAY / PROXY                                 |
|                                                                                 |
|                      Nginx Reverse Proxy / Load Balancer                        |
|             (Static Assets Serving + Gunicorn WSGI Proxying + SSL)              |
+---------------------------------------------------------------------------------+
                                       |
+---------------------------------------------------------------------------------+
|                                APPLICATION TIER                                 |
|                                                                                 |
|                    Django 5 + Django REST Framework                             |
|                                                                                 |
|  +--------------------+  +--------------------+  +----------------------------+ |
|  |   apps.accounts    |  |    apps.buyers     |  |       apps.pricing         | |
|  | Custom User Model  |  |  BuyerProfile,     |  | PriceSheet, PriceEntry,    | |
|  | SimpleJWT Auth     |  |  Verification,     |  | PriceRevision Audit,       | |
|  | Session Management |  |  WhatsApp Helpers  |  | Freshness Engine           | |
|  +--------------------+  +--------------------+  +----------------------------+ |
|                                                                                 |
|  +--------------------+  +--------------------+  +----------------------------+ |
|  | apps.subscriptions |  |   apps.payments    |  |         apps.audit         | |
|  | SubscriptionPlan,  |  | Razorpay Service,  |  | Immutable AuditLog,        | |
|  | BuyerSubscription  |  | HMAC Verification, |  | Security Tracking,         | |
|  | Entitlements Check |  | Webhook Idempotency|  | Real-time Admin Stats      | |
|  +--------------------+  +--------------------+  +----------------------------+ |
+---------------------------------------------------------------------------------+
                    |                                         |
                    v                                         v
+----------------------------------------+ +--------------------------------------+
|             DATA TIER                  | |           EXTERNAL SERVICES          |
|                                        | |                                      |
|    PostgreSQL 16 (Relational DB)       | |          Razorpay Payment API        |
|  - ACID Compliant Transactions         | |   - Orders & Subscriptions           |
|  - Indexed Price & Location Fields     | |   - Webhooks with HMAC SHA256        |
|  - Decimal Fields for Financial Exactness| |   - UPI, Cards, NetBanking         |
+----------------------------------------+ +--------------------------------------+
```

---

## 3. Modular Monorepo Structure

```
andhra-shrimp-price-hub/
├── backend/
│   ├── apps/
│   │   ├── accounts/       # Custom User model & JWT authentication
│   │   ├── buyers/         # Buyer profiles, verification & contact links
│   │   ├── locations/      # AP States, Districts, Mandis & Harbors
│   │   ├── products/       # Vannamei & Black Tiger shrimp, Count grades
│   │   ├── pricing/        # PriceSheets, Count entries, Revision history
│   │   ├── subscriptions/  # Subscription plans & buyer membership status
│   │   ├── payments/       # Razorpay service, checkout, webhooks & receipts
│   │   └── audit/          # Audit logging & admin management
│   ├── config/             # Django settings, URLs, WSGI, ASGI
│   ├── tests/              # Comprehensive automated test suite
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable layout and UI components
│   │   ├── context/        # Auth and Language contexts
│   │   ├── i18n/           # English and Telugu translation dictionaries
│   │   ├── pages/          # Home, Compare, Register, Login, Dashboard, etc.
│   │   ├── services/       # Typed Axios API client
│   │   ├── types/          # TypeScript interfaces
│   │   ├── App.tsx         # Route router and route guards
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── infrastructure/
│   ├── docker/             # Backend & Frontend Dockerfiles
│   └── nginx/              # Nginx server block configs
├── docs/                   # Architectural & technical documentation
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 4. Extensibility & Future Scaling
The schema is built to accommodate future expansion without major structural changes:
1. **Multi-State Support:** The `State` and `District` models easily support additional Indian aquaculture states (e.g. Odisha, Gujarat, Tamil Nadu, West Bengal).
2. **Multi-Product Expansion:** The `Product` and `ShrimpCount` tables support Black Tiger shrimp, scampi, crab, sea bass, or tilapia by adding rows to the product table without altering pricing logic.
3. **Multi-Language Expansion:** The `translations.ts` dictionary structure allows Hindi or Oriya to be added alongside English and Telugu effortlessly.
