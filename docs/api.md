# REST API Documentation: Andhra Shrimp Price Hub

All APIs are versioned under `/api/v1/`. Interactive OpenAPI 3.0 documentation and Swagger UI are available at `/api/docs/`.

---

## 1. Public Farmer Endpoints (No Authentication Required)

### GET `/api/v1/prices/`
Fetches active shrimp purchasing prices from verified, subscribed buyers.
- **Query Parameters:**
  - `district` (integer or string): Filter by District ID or name (e.g. `West Godavari`)
  - `market` (integer or string): Filter by Market Location ID or name
  - `count` (integer): Filter by shrimp count grade (e.g. `50`)
  - `min_price` (decimal): Filter prices >= min_price
  - `max_price` (decimal): Filter prices <= max_price
  - `buyer` (string): Search buyer company name
  - `fresh_only` (boolean): `true` to return rates updated within the last 24h
  - `sort` (string): `highest_price` (default), `lowest_price`, `recently_updated`, `oldest_update`, `location_asc`
  - `page` (integer): Page number (default 1)
- **Response Format:**
```json
{
  "count": 45,
  "results": [
    {
      "sheet_id": 1,
      "entry_id": 3,
      "buyer_id": 2,
      "buyer_name": "Bhimavaram Aqua Exports Ltd",
      "contact_person": "Satyanarayana Raju",
      "business_type": "Exporter",
      "shrimp_count": 50,
      "count_label": "50 Count",
      "price_per_kg": "385.00",
      "unit": "₹/kg",
      "state_name": "Andhra Pradesh",
      "district_name": "West Godavari",
      "market_name": "Bhimavaram Mandi & Trading Hub",
      "price_date": "2026-10-25",
      "updated_at": "2026-10-25T11:30:00Z",
      "is_fresh": true,
      "freshness_status": "Fresh Today",
      "is_highest": true,
      "tel_link": "tel:+919848012345",
      "whatsapp_link": "https://wa.me/919848012345?text=...",
      "buyer_note": "Spot payment. Count +/- 2.",
      "quantity_capacity": "Any quantity from 500kg up to 20 Tons",
      "is_featured": true
    }
  ]
}
```

### GET `/api/v1/locations/states/`
Returns all active states (e.g. Andhra Pradesh).

### GET `/api/v1/locations/districts/`
Returns active coastal districts. Optional query param: `?state=<id>`.

### GET `/api/v1/locations/markets/`
Returns active markets and trading centers. Optional query param: `?district=<id>`.

### GET `/api/v1/products/`
Returns available cultured shrimp products and count grade configurations.

---

## 2. Authentication Endpoints

### POST `/api/v1/auth/register/`
Registers a new buyer account and creates associated business profile.
- **Request Body:**
```json
{
  "email": "buyer@company.com",
  "password": "SecurePassword123!",
  "confirm_password": "SecurePassword123!",
  "role": "BUYER",
  "business_name": "Godavari Aqua Traders",
  "contact_person": "Venkata Rao",
  "phone": "+919848012345",
  "whatsapp_number": "+919848012345",
  "business_type": "WHOLESALER",
  "district_id": 1,
  "town_market": "Bhimavaram Mandi",
  "terms_agreed": true
}
```
- **Response:** HTTP 201 with JWT access & refresh tokens.

### POST `/api/v1/auth/login/`
Authenticates a user using email and password. Returns JWT access token and user metadata.

### GET `/api/v1/auth/me/`
Returns currently authenticated user profile, roles, and subscription status.

---

## 3. Buyer Management Endpoints (Requires `Authorization: Bearer <token>`)

### GET `/api/v1/buyers/dashboard/`
Returns buyer overview metrics, active subscription validity date, today's publication status, and active count entries count.

### GET `/api/v1/buyers/profile/` & PATCH `/api/v1/buyers/profile/`
Retrieve or update the buyer's business information, contact person, phone, and address.

### GET `/api/v1/prices/buyer/sheets/`
List all price sheets submitted by the authenticated buyer.

### POST `/api/v1/prices/buyer/sheets/`
Publish or save daily count-wise price sheet.
- **Strict Server Enforcement:** Returns `HTTP 403 Forbidden` if the buyer's subscription is inactive or expired!
- **Request Body:**
```json
{
  "product_id": 1,
  "market_location_id": 1,
  "price_date": "2026-10-25",
  "status": "PUBLISHED",
  "entries": [
    { "shrimp_count_id": 1, "price_per_kg": 510.00, "quantity_capacity": "10 Tons", "buyer_note": "Spot payment" },
    { "shrimp_count_id": 2, "price_per_kg": 440.00 },
    { "shrimp_count_id": 3, "price_per_kg": 385.00 }
  ]
}
```

### GET `/api/v1/prices/buyer/history/`
Returns historical price revisions with `previous_price`, `new_price`, and audit timestamp.

---

## 4. Subscriptions & Payments Endpoints

### GET `/api/v1/subscriptions/plans/`
Lists commercial buyer subscription plans (e.g. ₹499/month, ₹4999/year).

### POST `/api/v1/payments/checkout/`
Creates a server-side order with Razorpay using server credentials.

### POST `/api/v1/payments/verify/`
Validates Razorpay payment signature using HMAC-SHA256 and activates the subscription.
- **Request Body:**
```json
{
  "order_id": "order_ashp_...",
  "payment_id": "pay_ashp_...",
  "signature": "hmac_sha256_hex_digest",
  "plan_id": 1
}
```

### POST `/api/v1/payments/webhooks/razorpay/`
Raw-body webhook listener for Razorpay events (`payment.captured`, `order.paid`).
- Validates `X-Razorpay-Signature` against `RAZORPAY_WEBHOOK_SECRET`.
- Guarantees idempotent event processing.
