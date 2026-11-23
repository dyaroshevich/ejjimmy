# 🧠 LINE Integration Logic: LIFF vs. MINI App Strategy
**Project:** Tawan Power (Solar Krabi)
**Role:** Senior AI Strategist & Product Engineer

---

## 1. Technical Distinction: LIFF vs. LINE MINI App

### LIFF (LINE Front-end Framework) - *Our MVP Choice*
*   **What it is:** A web view that runs inside LINE but is hosted as a standard web page.
*   **Access:** Full access to `liff.getProfile()`, `liff.sendMessages()`, and hardware (camera/Bluetooth).
*   **Certification:** No audit required. We can launch it today.
*   **UX:** Can be styled to look 100% like a native app (Simulated MINI App).

### LINE MINI App (Verified) - *The Scale Phase*
*   **What it is:** A "Verified" version of LIFF with deep integration in the "Service" tab of LINE.
*   **Access:** Same as LIFF, but adds **Free Service Messages** (crucial for notifications).
*   **Certification:** Requires a registered Thai/Japanese company and a strict UI audit by LINE.
*   **UX:** Higher trust (Verified Badge) and discoverability in the LINE ecosystem.

---

## 2. The "Virtual MINI App" Concept
Instead of chasing the "Verified" status on day one, we implement a **Simulated MINI App** through CSS and JS at four progressive levels:

### Level 1: Seamless Identification (Base)
*   **Goal:** Recognize the client instantly upon opening.
*   **Action:** Initialize LIFF SDK, check `isLoggedIn`, and call `getProfile`.
*   **Result:** The chat greets the user by name: "Sawasdee, Khun [Name]!"

### Level 2: Native Interface (Visual)
*   **Goal:** Remove web clutter to feel like a built-in LINE feature.
*   **Action:** Hide global headers/footers, handle `safe-area-inset-top`, and disable external browser redirects.
*   **Result:** A clean, immersive UI that stays "inside" the LINE frame.

### Level 3: Interactive Closing (Action)
*   **Goal:** Send results directly to the user's chat history.
*   **Action:** Implement `liff.sendMessages()` with Flex Message templates.
*   **Result:** User saves their calculation as a beautiful card in their personal LINE chat.

### Level 4: Viral Growth (Marketing)
*   **Goal:** Turn users into referrers for neighbors and friends.
*   **Action:** Activate `liff.shareTargetPicker()` with pre-filled recommendation cards.
*   **Result:** Organic lead generation through Krabi's local social circles.

---

## 3. Business & Profitability for a Startup

### Cost Structure
*   **Initial Stage:** 100% Free. All incoming messages and initial LIFF usage cost nothing.
*   **Messaging Quotas:** Messaging API offers a free tier (e.g., 200 free outbound messages/month).
*   **Conversion ROI:** A single solar contract covers the cost of thousands of LINE messages.
*   **Efficiency:** Using **Flex Messages** instead of images reduces token/data usage and improves the professional look.

### The "Marketing Tunnel" (Sales Funnel)
1.  **Zero-Exit:** Once the user enters our LINE OA, they stay in our ecosystem. No tabs, no distractions.
2.  **Contextual CRM:** We don't just get a lead; we get a **Profile with History**. We know what they calculated before we even call them.
3.  **Low Friction:** "Add Friend" is the only step needed to start the conversion process.

---

## 4. Implementation Roadmap: The "Perfect Start"

### Step 1: Foundation (Admin)
- [ ] **LINE Developers:** Create a Provider and a Messaging API Channel.
- [ ] **LIFF Setup:** Create a LIFF App (Mode: Full) linked to `https://tawanpower.vercel.app/chat`.
- [ ] **Keys:** Secure the `LIFF_ID`, `Channel Access Token`, and `Channel Secret`.

### Step 2: Technical Integration (Code)
- [ ] **SDK:** Install `@line/liff`.
- [ ] **Init Logic:** Implement Level 1 (Identification) in the chat entry point.
- [ ] **UI Adaptation:** Apply Level 2 (Native Interface) styling via `useLineBrowser`.

### Step 3: Sales Content (Design)
- [ ] **Rich Menu:** Design 6 tiles (Calculator, Catalog, FAQ, Case Studies, Contact, About).
- [ ] **Flex Templates:** Design the "Result Card" and "Product Card" for chat interaction.

### Step 4: Engagement & ROI
- [ ] **Notify Admin:** Ensure `api/notify-line` is active for real-time lead alerts.
- [ ] **QR Strategy:** Generate a LIFF-deep-link QR code for physical marketing in Krabi.

---

## ⚖️ Strategic Mandate
**DO NOT** rush the "Verified" status. Focus on the **UI/UX excellence** of the LIFF version first. The user should not feel the difference between a "Certified" app and our "Simulated" app. Trust is built via design quality and AI responsiveness, not a badge.

---
**Status:** Strategic Mandate Issued
**Date:** May 2026
