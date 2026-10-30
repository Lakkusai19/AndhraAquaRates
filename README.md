# ANDHRA AQUA RATES

[![Full Stack: React + Django](https://img.shields.io/badge/Stack-React%20%7C%20Django%20REST-blue)](https://github.com)
[![Status: Production Ready](https://img.shields.io/badge/Status-Production%20Ready-emerald)](https://github.com)
[![Payments: Razorpay Subscriptions](https://img.shields.io/badge/Payments-Razorpay%20Verified-sky)](https://razorpay.com)

A complete full-stack web application designed for shrimp farmers across coastal Andhra Pradesh to compare current purchasing prices by shrimp count, location, and buyer in real-time.

---

## 1. Key Product Principles & Features

- **100% Free For Farmers:** Farmers can browse all active prices, filter by district/mandi/count, sort by rate, and contact buyers via telephone or prefilled WhatsApp messages without registering, logging in, or paying any fee.
- **Paid Subscriptions For Buyers:** Buyers (exporters, processors, wholesalers) register a verified profile and must maintain an active paid subscription (configurable launch price of ₹499/month) via Razorpay before publishing or updating daily price sheets.
- **Count-Wise Multi-Price Sheet Management:** Subscribed buyers can enter purchase rates for 30, 40, 50, 60, 70, 80, 90, 100, 120, and 150 counts in a single submission.
- **Price Freshness Rules:** Server-calculated freshness threshold (default 24h) categorizes quotes as "Fresh Today" or "Stale / Needs Verification".
- **Cryptographic Payment Verification:** HMAC-SHA256 signature verification for Razorpay checkout and webhooks. Server-side activation guarantees publishing privileges are only granted on confirmed payments.
- **Price Revisions & Security Audit Trail:** Every price change records an immutable `PriceRevision` with previous rate, new rate, and timestamp.
- **English & Telugu Language Readiness:** Internationalization dictionary (`translations.ts`) with top-bar language switcher for rural farmers.
- **Admin Dashboard:** Role-based React admin portal for buyer verification/suspension, stats derived from real database records, audit logs, and payment reconciliation.

---

## 2. Project Directory Structure

```
andhra-shrimp-price-hub/
├── backend/                        # Django REST Framework Backend
│   ├── apps/
│   │   ├── accounts/               # Custom User & SimpleJWT auth
│   │   ├── buyers/                 # BuyerProfile & WhatsApp chat links
│   │   ├── locations/              # AP States, coastal Districts & Mandis
│   │   ├── products/               # Vannamei / Tiger shrimp & Counts
│   │   ├── pricing/                # PriceSheet, PriceEntry, PriceRevision
│   │   ├── subscriptions/          # SubscriptionPlan & BuyerSubscription
│   │   ├── payments/               # Razorpay Service, Checkout & Webhooks
│   │   └── audit/                  # AuditLog & Admin operations
│   ├── config/                     # Settings, URLs, WSGI, ASGI
│   ├── tests/                      # Automated API test suite
│   ├── manage.py
│   └── requirements.txt
├── frontend/                       # React 18 TypeScript Single Page App
│   ├── src/
│   │   ├── components/             # Reusable Navbar, Footer, UI components
│   │   ├── context/                # AuthContext and LanguageContext
│   │   ├── i18n/                   # English and Telugu translation dictionaries
│   │   ├── pages/                  # Home, Compare, Register, Login, Dashboard, etc.
│   │   ├── services/               # Typed Axios API service layer
│   │   ├── types/                  # Shared TypeScript interfaces
│   │   ├── App.tsx                 # Route router and navigation guards
│   │   └── index.css               # Modern Tailwind CSS theme styling
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── infrastructure/
│   ├── docker/                     # Backend & Frontend Dockerfiles
│   └── nginx/                      # Nginx reverse proxy configuration
├── docs/                           # Architecture, API, Payments & Security docs
├── docker-compose.yml              # Production container stack with Postgres 16
├── .env.example                    # Environment configuration template
└── README.md
```

---

## 3. Quickstart & Installation

### Option A: Local Development

#### 1. Setup Backend
```bash
# In the project root:
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Run migrations
python backend/manage.py migrate

# Seed Andhra Pradesh locations, counts, and demo data
python backend/manage.py seed_data

# Start Django development server (Port 8000)
python backend/manage.py runserver 0.0.0.0:8000
```

#### 2. Setup Frontend
```bash
# In a new terminal window:
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

### Option B: Docker Compose Full Stack
```bash
# Start PostgreSQL, Django/Gunicorn, and React/Nginx
docker-compose up --build -d

# Verify services
docker-compose ps
```
Services will be live at:
- Frontend Web App: `http://localhost:5173` or `http://localhost:80`
- REST API & OpenAPI Docs: `http://localhost:8000/api/docs/`

---

## 4. Pre-Configured Demo Accounts

The `seed_data` command creates authentic Andhra Pradesh demo accounts for immediate testing:

| Role | Email | Password | Status | Notes |
|---|---|---|---|---|
| **Administrator** | `admin@andhrashrimp.com` | `AdminPassword123!` | Active | Access to `/admin` dashboard |
| **Active Buyer** | `bhimavaram.exports@example.com` | `BuyerPassword123!` | Subscribed | Bhimavaram Aqua Exports Ltd |
| **Active Buyer** | `godavari.coldchain@example.com` | `BuyerPassword123!` | Subscribed | Konaseema Processor |
| **Active Buyer** | `kakinada.seafood@example.com` | `BuyerPassword123!` | Subscribed | Kakinada Harbor Exporter |
| **Active Buyer** | `nellore.seafoods@example.com` | `BuyerPassword123!` | Subscribed | Nellore Seafoods |
| **Expired Buyer** | `nizampatnam.traders@example.com` | `BuyerPassword123!` | Expired | Tests publishing block & renewal |

*Note: Farmers require no credentials and can browse immediately.*

---

## 5. Running Automated Tests

Run the complete backend test suite covering public browsing, active subscription rules, price freshness, Razorpay HMAC signature checks, and webhook idempotency:

```bash
# Activate venv, then run:
python backend/manage.py test tests
```

**Test Results:**
```
Found 8 test(s).
........
----------------------------------------------------------------------
Ran 8 tests in 8.102s

OK
```

Frontend build test:
```bash
cd frontend
npm run build
```
*(Compiles cleanly with zero errors)*

---

## 6. Razorpay Configuration & Production Activation

1. Sign in to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Settings → API Keys** to generate:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
3. Navigate to **Settings → Webhooks**:
   - Add URL: `https://yourdomain.com/api/v1/payments/webhooks/razorpay/`
   - Select events: `payment.captured`, `order.paid`
   - Set secret: `RAZORPAY_WEBHOOK_SECRET`
4. Set these in your `.env` file. In test mode (`rzp_test_...`), the platform safely allows full end-to-end simulated checkout and cryptographic validation.
