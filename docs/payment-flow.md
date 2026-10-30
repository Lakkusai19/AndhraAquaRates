# Razorpay Payment & Subscription Lifecycle

## 1. Overview & Security Principles
In **Andhra Shrimp Price Hub**, publishing privileges are strictly tied to a server-verified subscription status. The platform implements the following mandatory payment principles:
1. **Never trust frontend callbacks:** Navigation to a success URL or frontend client state never grants publishing permissions.
2. **Server-Side Signature Verification:** All checkouts are verified via HMAC-SHA256 signature calculation using the Razorpay Key Secret.
3. **Webhook Verification & Idempotency:** Webhook events verify the `X-Razorpay-Signature` header against `RAZORPAY_WEBHOOK_SECRET`. Duplicate webhook deliveries are detected via unique `event_id` and handled safely without double-charging or corrupting subscriptions.
4. **No Plaintext Secrets:** Razorpay Key Secret and Webhook Secret are stored exclusively in backend environment variables and are never transmitted to the frontend React application.

---

## 2. Payment Lifecycle Flow

```
+------------+               +---------------+               +-------------------+               +--------------+
| React User |               | Django Server |               | Razorpay Checkout |               |  PostgreSQL  |
+------------+               +---------------+               +-------------------+               +--------------+
      |                              |                                 |                                |
      | 1. Select Plan (₹499)        |                                 |                                |
      |----------------------------->|                                 |                                |
      |                              | 2. Create Order                 |                                |
      |                              |-------------------------------->|                                |
      |                              |<--------------------------------|                                |
      |                              |    Returns order_id             |                                |
      | 3. Returns order_id & key_id |                                 |                                |
      |<-----------------------------|                                 |                                |
      |                                                                |                                |
      | 4. Open Razorpay Checkout Modal                                |                                |
      |--------------------------------------------------------------->|                                |
      |                                                                |                                |
      | 5. Farmer/Buyer completes UPI / Card payment                   |                                |
      |                                                                |                                |
      | 6. Returns payment_id, order_id, signature                     |                                |
      |<---------------------------------------------------------------|                                |
      |                                                                |                                |
      | 7. POST /api/v1/payments/verify/                               |                                |
      |----------------------------->|                                 |                                |
      |                              | 8. Verify HMAC-SHA256           |                                |
      |                              |    order_id + "|" + payment_id  |                                |
      |                              |    Signature Match?             |                                |
      |                              |                                 |                                |
      |                              | 9. Atomic Transaction           |                                |
      |                              |----------------------------------------------------------------->|
      |                              |    - PaymentTransaction = SUCCESS                                |
      |                              |    - BuyerSubscription = ACTIVE                                 |
      |                              |    - current_period_end = now + 30d                              |
      |                              |    - AuditLog recorded                                           |
      |                              |<-----------------------------------------------------------------|
      |                              |                                                                  |
      | 10. HTTP 200 OK              |                                                                  |
      |     Subscription ACTIVE      |                                                                  |
      |<-----------------------------|                                                                  |
      |                              |                                                                  |
      | 11. Unlock Daily Rate Form   |                                                                  |
```

---

## 3. Webhook Handling Architecture
Razorpay webhook events (e.g. `payment.captured`, `order.paid`, `subscription.charged`) provide asynchronous reconciliation for cases where a user closes the browser before frontend verification.

### Processing Guarantees:
1. **Raw Body Consumption:** The endpoint `/api/v1/payments/webhooks/razorpay/` inspects `request.body` before any JSON parsing to compute `hmac.new(webhook_secret, raw_body, hashlib.sha256).hexdigest()`.
2. **Idempotent Storage:** Each incoming event is checked in the `ashp_webhook_events` table by `event_id`. If previously processed, the endpoint returns `HTTP 200 OK` immediately, preventing race conditions or duplicate period extension.
3. **Database Transactions:** Subscription state changes occur within `transaction.atomic()`.

---

## 4. Test Mode & Simulation Engine
To facilitate automated testing and review in environments without live Razorpay credentials:
- When `RAZORPAY_KEY_ID` begins with `rzp_test_mock` or keys are absent, the server enters safe simulation mode.
- Frontend displays an instant test checkout confirmation modal that computes valid test credentials.
- Test suites in `backend/tests/test_api.py` validate this end-to-end without network dependencies.
