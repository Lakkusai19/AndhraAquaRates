# Security & Abuse Prevention Architecture

## 1. Authentication & Session Security
- **Password Storage:** Uses Django's industry-standard PBKDF2 with SHA256 password hashing. Plaintext passwords are never logged or stored.
- **JWT Architecture:** Employs SimpleJWT with access tokens (short lifespan) and refresh tokens.
- **Anti-Enumeration:** Registration and password recovery endpoints return generalized status messages to prevent malicious enumeration of registered buyer identities.

## 2. Authorization & Object-Level Protection
- **Role-Based Access Control:** Separate permissions for `FARMER`, `BUYER`, and `ADMIN`.
- **Ownership Verification:** Buyers can only view, edit, or submit price sheets for their own profile. Attempting to modify another buyer's price sheet returns `HTTP 403 Forbidden` or `HTTP 404 Not Found`.
- **Active Subscription Enforcement:** Every price publishing and updating endpoint queries `BuyerProfile.has_active_subscription()` on the backend. No publishing action is permitted based on frontend state.

## 3. Financial Integrity & Razorpay Verification
- **Cryptographic Verification:** Signatures generated during Razorpay checkout must match `hmac.new(secret, order_id|payment_id, sha256).hexdigest()`.
- **Atomic Transactions:** All payment receipts, transaction updates, and subscription activations run within `transaction.atomic()` to prevent partial state corruption.
- **Decimal Fields:** All currency and price calculations use Python `Decimal` and PostgreSQL `numeric/decimal` fields, preventing floating-point rounding errors.

## 4. Input Sanitization & Attack Prevention
- **SQL Injection Prevention:** 100% of database interactions run through Django's parameter-binding ORM. Raw unescaped SQL queries are prohibited.
- **Cross-Site Scripting (XSS):** React auto-escapes rendered text. HTML injection via notes or names is prevented.
- **Cross-Origin Resource Sharing (CORS):** Strict origin allowlisting configured via `django-cors-headers`.

## 5. Audit Logging
Every critical administrative and financial operation (user registration, login, checkout initiation, payment verification, price updates, buyer suspension) writes an immutable record to the `ashp_audit_logs` table with actor, action, timestamp, and metadata.
