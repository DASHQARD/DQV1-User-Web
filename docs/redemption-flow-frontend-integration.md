# Redemption Flow — Frontend Integration Guide

This document describes the redemption endpoints and the end-to-end flows the
frontend must implement. It covers the two redemption methods (Vendor ID and
Vendor Mobile Money Number), branch selection, card visibility, and the DashPro
on-platform vs off-platform behaviour.

- Base URL: `/api/v1`
- All endpoints below are prefixed with `/api/v1` (e.g. the full path for
  `GET /redemptions/search/vendors` is `GET /api/v1/redemptions/search/vendors`).
- Content type: `application/json`.

---

## 1. Conventions

### 1.1 Response envelope

Every endpoint returns the same envelope:

```json
{
  "status": "success",
  "statusCode": 200,
  "message": "Human readable message",
  "data": {}
}
```

List endpoints add a `pagination` object alongside `data` (which is an array).

Error envelope:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Reason for the error"
}
```

### 1.2 Status codes

| Code | Meaning |
|---|---|
| 200 | Read/lookup succeeded |
| 202 | Redemption accepted and processing (use for `/cards` and `/dash-pro`) |
| 400 | Business validation failed |
| 401 | Missing/invalid auth (authenticated endpoints only) |
| 403 | Authenticated but not allowed |
| 404 | Resource not found |
| 422 | Request shape/format validation failed |

Treat `202` as success.

### 1.3 Input formats

- **Phone number** — international format, optional leading `+`, 10–15 digits.
- **GVID** — e.g. `GH-0001`. Matched case-insensitively.
- **branch_id, card_id** — UUID v4 strings.
- **amount** — number, `0.01`–`100000`, max 2 decimal places.
- **card_type** — one of `DashPro`, `DashGo`, `DashX`, `DashPass`.

### 1.4 Pagination (cursor based)

List endpoints accept `limit` (1–100, default 10) and `after` (opaque cursor).

> **Gotcha:** `branch_count` in vendor search results is returned as a **string**.

### 1.5 Authentication

- **Guest variant** (no auth) — recipient `phone_number` in the request.
- **Authenticated variant** (`/users/...`) — phone from logged-in user; may omit `phone_number`.

---

## 2. The two redemption methods

### Method A — Vendor ID (on-platform)

Supported card types: **DashGo, DashPro, DashX, DashPass**.

### Method B — Vendor Mobile Money Number (off-platform)

Supported card type: **DashPro only**.

---

## 3. Flow walkthroughs

See sections 3.1 and 3.2 in the product email / backend handoff for step-by-step API sequences.

---

## 4. Endpoint reference

| Endpoint | Auth | Notes |
|---|---|---|
| `GET /redemptions/search/vendors` | public | Name / partial GVID search |
| `GET /redemptions/search/vendors/:gvid` | public | Exact GVID |
| `GET /redemptions/vendors/:gvid/catalog` | public | Vendor branches + redeemable cards (redemption flow only; not vendor purchase profile) |
| `GET /redemptions/redeemable-cards` | public | Aggregated balances (unauthenticated phone lookup) |
| `GET /redemptions/users/redeemable-cards` | Bearer | Aggregated balances (member) |
| `GET /guest-redemptions/assigned-cards` | Bearer (guest) | Guest cards on phone |
| `GET /guest-redemptions/recipient-amounts/dash-pro` | Bearer (guest) | Guest DashPro balance |
| `GET /guest-redemptions/recipient-amounts/dash-go` | Bearer (guest) | Guest DashGo balance (vendor/branch) |
| `POST /redemptions/momo/resolve-name` | public | MoMo recipient confirmation |
| `POST /redemptions/cards` | public | Method A (guest body includes `phone_number`) |
| `POST /redemptions/users/cards` | Bearer | Method A (auth) |
| `POST /redemptions/dash-pro` | public | Method B (guest) |
| `POST /redemptions/users/dash-pro` | Bearer | Method B (auth) |

---

## 5. Card-type input matrix (Method A `/cards`)

| card_type | amount | card_id |
|---|---|---|
| DashGo | required | — |
| DashPro | required | — |
| DashX | — | required |
| DashPass | — | required |

`branch_id` and `vendor_gvid` are **required** for all Method A redemptions.

---

## 7. Breaking change

`POST /redemptions/cards` and `POST /redemptions/users/cards` now require `branch_id` and `vendor_gvid`.
