# Vendor Mobile Money — DashPro Redemption QA Checklist

QA sign-off checklist for the user story **“Redeem DashPro Using Vendor Mobile Money Number”**.

| Field | Value |
| --- | --- |
| **Primary surface** | Public Redeem page — `/redeem` (`RedemptionPage.tsx`) |
| **Secondary surface** | Dashboard shared `Redeem` component (logged-in members; DashPro uses vendor MM in a multi-card-type form) |
| **Scope** | DashPro only via **Vendor mobile money** method |
| **Out of scope** | Vendor ID redemption (DashGo, DashX, DashPass, on-platform DashPro) |

---

## Test data prerequisites

Prepare the following before executing cases:

| Item | Notes |
| --- | --- |
| **Member account** | Logged-in user with DashPro balance > 0 |
| **Member — zero balance** | Logged-in user with DashPro balance = 0 |
| **Guest phone** | Phone with assigned DashPro balance (guest OTP flow) |
| **Guest — zero balance** | Guest phone with no DashPro funds |
| **Valid vendor MM number** | Ghana MoMo number that resolves to a known account name (MTN / Vodafone / AirtelTigo) |
| **Invalid vendor MM number** | Number that fails name resolution |
| **Staging API** | `.env` points to staging backend with MoMo resolve + DashPro redemption enabled |

---

## Business rules (cross-cutting)

| ID | Rule | Test focus |
| --- | --- | --- |
| BR-1 | Only DashPro in vendor MM flow | No DashGo / DashX / DashPass UI on vendor MM path |
| BR-2 | Vendor onboarding not required | Redemption works for off-platform MM number |
| BR-3 | Vendor name validation mandatory | Cannot submit without verified vendor name |
| BR-4 | Amount ≤ available DashPro balance | Inline error + disabled submit |

---

## AC1 — Redemption method selection

**Given** I am on the redemption page, **when** I select “Vendor Mobile Money”, **then** the system initiates the Vendor Mobile Money redemption flow.

| ID | Persona | Preconditions | Steps | Expected result | Pass |
| --- | --- | --- | --- | --- | --- |
| AC1-01 | Any | On `/redeem`, step = method | Observe method options | “Vendor mobile money” and “Vendor ID” are visible | ☐ |
| AC1-02 | Any | On method step | Select **Vendor mobile money** | Navigates to details step; heading “Vendor mobile money” shown | ☐ |
| AC1-03 | Any | Vendor MM selected | Read helper copy | Copy states only DashPro can be redeemed via this option | ☐ |
| AC1-04 | Any | Vendor MM selected | Inspect card-type UI | No DashGo / DashX / DashPass selectors shown (BR-1) | ☐ |
| AC1-05 | Any | Vendor MM selected | Click **Back** | Returns to method selection; form state resets | ☐ |

---

## AC2 — Vendor number entry

**Given** Vendor Mobile Money is selected, **when** I enter a valid Mobile Money number, **then** the system retrieves and displays the account holder’s name.

| ID | Persona | Preconditions | Steps | Expected result | Pass |
| --- | --- | --- | --- | --- | --- |
| AC2-01 | Member | Vendor MM flow, authenticated | Enter valid vendor MM number | “Verifying…” then green **Verified** badge | ☐ |
| AC2-02 | Member | Valid number entered | Observe confirmation UI | Account holder name displayed in green confirmation box (“Account verified”) | ☐ |
| AC2-03 | Guest | Guest phone verified, vendor MM flow | Enter valid vendor MM number | Same verification UI as member (uses guest resolve API) | ☐ |
| AC2-04 | Member | Vendor MM flow | Enter incomplete number (< 10 digits) | No verification; no false “Verified” state | ☐ |
| AC2-05 | Member | Vendor MM flow | Enter invalid / unresolvable number | Error message shown; not verified | ☐ |
| AC2-06 | Member | Vendor MM flow | Change number after verification | Previous name cleared; re-verifies new number | ☐ |

**API references (for debugging):**

- Member lookup: account lookup / MoMo resolve
- Guest lookup: `POST /guest-redemptions/momo/resolve-name`

---

## AC3 — Vendor confirmation

**Given** the vendor name has been retrieved, **when** I confirm the vendor, **then** the system proceeds to balance retrieval.

> **Implementation note:** There is no separate “Confirm vendor” button. Verification + displayed name acts as implicit confirmation. QA should validate the *outcome* (user can proceed to amount/balance) rather than a dedicated confirm CTA.

| ID | Persona | Preconditions | Steps | Expected result | Pass |
| --- | --- | --- | --- | --- | --- |
| AC3-01 | Member | Vendor name displayed, verified | Observe form | Amount field and balance section are accessible | ☐ |
| AC3-02 | Member | Vendor not verified | Attempt to click **Redeem DashPro** | Button disabled; toast if forced submit | ☐ |
| AC3-03 | Guest | Vendor verified | Observe form | Amount field and balance section accessible after guest auth | ☐ |

---

## AC4 — Balance retrieval

| ID | Persona | Preconditions | Steps | Expected result | Pass |
| --- | --- | --- | --- | --- | --- |
| AC4-01 | Member | Vendor MM flow, logged in | Land on details step (vendor may or may not be verified yet) | DashPro balance loads (“Loading DashPro balance…” then amount in GHS) | ☐ |
| AC4-02 | Member | Balance loaded | Observe balance card | Label “DashPro balance”; value matches API | ☐ |
| AC4-03 | Guest | Not authenticated | Open vendor MM flow | “Verify your phone” CTA shown; vendor MM fields hidden | ☐ |
| AC4-04 | Guest | Complete guest OTP verification | Return to vendor MM flow | Vendor MM fields visible; balance loads for guest phone | ☐ |
| AC4-05 | Guest | Balance loaded | Compare to API | Matches `GET /guest-redemptions/recipient-amounts/dash-pro` | ☐ |
| AC4-06 | Member | Balance loaded | Compare to API | Matches `GET /redemptions/recipient-amounts/dash-pro` (authenticated) | ☐ |

> **Flow deviation vs story wording:** Guest phone is collected *before* vendor entry (OTP modal), not after vendor confirmation. Functionally guests still get balance after auth; document as accepted UX unless product changes it.

---

## AC5 — Zero balance

**Given** balance has been retrieved, **when** DashPro balance is zero, **then** display “No Available DashPro Balance”.

| ID | Persona | Preconditions | Steps | Expected result | Pass |
| --- | --- | --- | --- | --- | --- |
| AC5-01 | Member | DashPro balance = 0 | Open vendor MM flow | Amber box: **No Available DashPro Balance** + explanatory copy | ☐ |
| AC5-02 | Member | Zero balance | Enter amount + verified vendor | **Redeem DashPro** button disabled | ☐ |
| AC5-03 | Member | Zero balance | Force submit (if possible) | Toast: “No Available DashPro Balance” | ☐ |
| AC5-04 | Guest | DashPro balance = 0 | Same as above | Same zero-balance messaging and disabled submit | ☐ |

---

## AC6 — Redemption amount validation

**Given** available balance, **when** I enter a redemption amount, **then** amount must not exceed available DashPro balance.

| ID | Persona | Preconditions | Steps | Expected result | Pass |
| --- | --- | --- | --- | --- | --- |
| AC6-01 | Member | Balance > 0, vendor verified | Enter amount **equal to** balance | No insufficient-balance error; submit enabled | ☐ |
| AC6-02 | Member | Balance > 0, vendor verified | Enter amount **less than** balance | No error; submit enabled | ☐ |
| AC6-03 | Member | Balance > 0, vendor verified | Enter amount **greater than** balance | Red inline: “Insufficient DashPro balance. Available: GHS X.XX” | ☐ |
| AC6-04 | Member | Amount > balance | Observe button | **Redeem DashPro** disabled | ☐ |
| AC6-05 | Member | Any | Enter invalid amount (e.g. `1.234`, negative, empty) | Submit disabled; toast on invalid submit | ☐ |
| AC6-06 | Member | Any | Enter amount with 2 decimal places (e.g. `10.50`) | Accepted | ☐ |

---

## AC7 — Successful redemption

**Given** amount is within balance, **when** I submit, **then** redemption succeeds, balance updates, vendor receives funds, transaction record created.

| ID | Persona | Preconditions | Steps | Expected result | Pass |
| --- | --- | --- | --- | --- | --- |
| AC7-01 | Member | Verified vendor, valid amount ≤ balance | Click **Redeem DashPro** | Loading state; then success step | ☐ |
| AC7-02 | Member | Redemption succeeded | Observe success UI | Shows amount, transaction reference / redemption code (if API returns) | ☐ |
| AC7-03 | Member | Redemption succeeded | Re-open flow or refresh balance | DashPro balance reduced by redeemed amount | ☐ |
| AC7-04 | Member | Redemption succeeded | Check backend / vendor | Vendor receives MoMo payout (backend QA) | ☐ |
| AC7-05 | Member | Redemption succeeded | Check transaction history | New redemption record exists (backend / member history) | ☐ |
| AC7-06 | Guest | Verified vendor, valid amount ≤ balance | Click **Redeem DashPro** | Success step; guest redemption API succeeds | ☐ |
| AC7-07 | Guest | Redemption succeeded | Re-check guest balance | Balance reduced accordingly | ☐ |

**API references:**

- Member: `POST /redemptions/users/dash-pro`
- Guest: `POST /guest-redemptions/cards` (`card_type: DashPro`, `vendor_phone_number`, `provider`, `amount`)

---

## AC8 — Failed redemption (exceeds balance)

**Given** amount exceeds balance, **when** I attempt redemption, **then** appropriate error is shown.

| ID | Persona | Preconditions | Steps | Expected result | Pass |
| --- | --- | --- | --- | --- | --- |
| AC8-01 | Member | Balance = B | Enter amount > B | Inline insufficient-balance message (AC6-03) | ☐ |
| AC8-02 | Member | Amount > balance | Click **Redeem DashPro** | Button remains disabled; no API call | ☐ |
| AC8-03 | Member | Edge: amount barely over balance | e.g. balance 190.62, enter 190.63 | Error shown; submit disabled | ☐ |

---

## Additional regression cases

| ID | Area | Steps | Expected result | Pass |
| --- | --- | --- | --- | --- |
| REG-01 | Network offline | Disable network mid-flow | `NetworkWarning` banner; submit disabled | ☐ |
| REG-02 | Network error on lookup | Simulate failed MoMo resolve | User-friendly error; not verified | ☐ |
| REG-03 | Network error on balance | Simulate failed balance fetch | “Unable to fetch DashPro balance” or network message | ☐ |
| REG-04 | Provider detection | Enter number for each telco | Correct provider sent on submit | ☐ |
| REG-05 | Method isolation | Select Vendor ID after Vendor MM | DashGo/DashX/DashPass available only on Vendor ID path | ☐ |
| REG-06 | Deep link | Open `/redeem?method=vendor_mobile_money` (if supported) | Lands in vendor MM details step | ☐ |

---

## Dashboard surface (secondary — logged-in members)

The shared dashboard `Redeem` component supports DashPro via vendor MM alongside other card types. Run if this surface is in scope for release.

| ID | Steps | Expected result | Pass |
| --- | --- | --- | --- |
| DASH-01 | Open dashboard Redeem (if routed) | DashPro selected shows vendor MM input | ☐ |
| DASH-02 | Verify vendor MM + enter amount ≤ balance | **Redeem Now** succeeds via `POST /redemptions/users/dash-pro` | ☐ |
| DASH-03 | Switch to DashGo / DashX / DashPass | Vendor search shown instead of MM number | ☐ |

---

## Sign-off

| Role | Name | Date | Notes |
| --- | --- | --- | --- |
| QA | | | |
| Product | | | |
| Engineering | | | |

**Definition of Done mapping:**

- [ ] Vendor Mobile Money redemption works for logged-in users (AC1–AC8 member cases)
- [ ] Vendor Mobile Money redemption works for guest users (AC2–AC8 guest cases)
- [ ] Balance validation implemented (AC5, AC6, AC8)
- [ ] QA sign-off completed (this checklist)
