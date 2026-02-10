# Corporate feature visibility and user messaging

This doc summarizes how we help corporate users understand **why** some features are available or not, and what to do next.

## Current implementation

### 1. **Account status banner (Dashboard)**

- **Location:** Top of Corporate Dashboard (home).
- **Behaviour:**
  - **Profile incomplete:** Blue info banner — “Complete your profile to unlock all features” and explains that vendor accounts, purchases, and vendor management stay locked until onboarding is complete and the account is approved.
  - **Pending approval:** Amber banner — “Your account is under review” and explains that features like Create vendor account, Purchases, Vendor Invitations, All Vendors will appear after approval; Requests and dashboard remain usable.
  - **Full access:** No banner.

So users always see **why** things are locked and what step they’re on (profile vs approval).

### 2. **Sidebar: items visible but disabled**

- Purchases, Vendor Invitations, All Vendors (and Admins where applicable) are **no longer hidden** when the account is not approved.
- They stay in the sidebar as **disabled** (greyed out, not clickable).
- Tooltip on hover (collapsed and expanded):  
  “{Section name} — Complete onboarding and get approved to access this section.”

Users see that these sections exist and that access depends on onboarding + approval.

### 3. **Create a vendor account**

- Button remains visible in the account popover but is disabled when the user doesn’t have full access.
- **Inline text** under the button when disabled:  
  “Complete onboarding and get approved to unlock.”
- Tooltip on the info icon:  
  “Complete onboarding and get approved to create vendor accounts.”

So the reason is visible without relying only on hover.

### 4. **Onboarding widget**

- Complete Corporate Widget copy updated to:  
  “Finish all 2 steps to activate your corporate account. **After approval you’ll get access to purchases, vendor accounts, and more.**”

Makes it explicit that approval is a separate step after onboarding.

---

## Optional: bulk gifting / bulk purchase

- **Bulk gifting configuration** is not yet available; corporate users cannot fully use it yet.
- **Suggested UX** (if you expose the feature in the UI):
  - On the **Purchase** page, if the “Bulk Purchase” tab (or bulk gifting entry) is shown but not fully ready:
    - Add a small “Coming soon” or “In development” badge next to the tab/link, and/or
    - A one-line note under the tab: “Bulk gifting configuration is coming soon. You can use individual purchases in the meantime.”
- If the bulk entry point is hidden until the feature is ready, no change is needed beyond the above status and onboarding messaging.

---

## Summary

| User state                         | What they see                                                                                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Profile incomplete                 | Status banner (complete profile); sidebar items disabled with tooltip; Create vendor account disabled with inline reason; widget explains “after approval” access. |
| Profile complete, pending approval | Status banner (under review); same disabled sidebar items and Create vendor account + tooltips/inline text.                                                        |
| Approved                           | No banner; all corporate features enabled.                                                                                                                         |
| Bulk gifting                       | Optional: “Coming soon” badge or short copy where the feature is shown.                                                                                            |

This gives a single, consistent story: **complete profile → get approved → full access**, and explains why “Create vendor account” or other features are sometimes unavailable.
