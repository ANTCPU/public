# Turtle Enterprises — Rental Operations System
## 253 Lake Road · Thomasville, NC 27360

Last Updated: May 16, 2026
Version: 1.0.0
Owner: Turtle Enterprises LLC · Antony Ciccone

---

## The Property

- **Address:** 253 Lake Road, Thomasville, NC 27360
- **Type:** 3 Bedroom · 1 Full Bath · 2-Car Garage · Private Deck
- **Status:** Move-in Ready · Open Application Season
- **Target Rent:** $1,500/mo · All utilities included
  - Lawn care · Power · Water · Cable · Trash · Home Security
- **Move-in Cost:** $3,000 (first + last month)
- **Lease Term:** 1 Year minimum
- **Income Requirement:** 3x monthly rent = $4,500/mo verifiable income

---

## The Funnel — 4 Steps

### Step 1 — Free Application (Sprint 1 · Active)
- Applicant fills out free application on 253LakeRd27360.html
- Fields: First/Last Name · Email · Phone · Current Address · Monthly Income · Employer · Desired Move-in Date · Additional Info
- On submit → Discord alert fires to #applicants webhook
- Human (Antony) reviews application in Discord
- Income below $4,500/mo → politely declined via email
- Income verified → move to Step 2

### Step 2 — Virtual Tour Unlocked (Sprint 2)
- Approved applicants receive email with virtual tour link
- Tour page: turtle/Rental/tour.html
- Not publicly linked — only accessible via direct link
- Page includes: full property walkthrough · specs · neighborhood info · application fee CTA
- Applicant can schedule in-person showing from tour page

### Step 3 — $99 Background Check Fee (Sprint 3)
- Applicant pays $99 via payment link (Stripe or similar)
- Payment confirmation fires Discord alert to #applicants
- Antony runs background check manually
- Pass → added to waitlist with position number
- Fail → notified professionally, fee non-refundable per NC law

### Step 4 — Waitlist + Lease (Sprint 4)
- Waitlist dashboard: turtle/Rental/waitlist.html (internal)
- Waitlist is source of truth for move-in dates and tour scheduling
- Top of list signs NC Standard Residential Lease Agreement (Form 410-T)
- Move-in date assigned · $3,000 collected · keys handed over
- Each subsequent applicant waits for end of current lease
- Lease renewal subject to: no damages · no repairs needed · good standing

---

## Human in the Loop — Every Step

| Step | Trigger | Human Action |
|---|---|---|
| Step 1 | Application submitted | Review income + employment in Discord |
| Step 1 | Approved | Send virtual tour link via email |
| Step 1 | Declined | Send polite decline email |
| Step 2 | Tour viewed | Follow up if showing requested |
| Step 3 | $99 paid | Run background check · update waitlist |
| Step 3 | Check passed | Send waitlist position confirmation |
| Step 3 | Check failed | Send professional decline |
| Step 4 | Top of waitlist | Schedule signing · collect $3,000 · assign move-in date |

---

## Revenue Model

| Source | Amount | Timing |
|---|---|---|
| Application fees ($99) | $99 x applicants | Ongoing during open season |
| Move-in cost | $3,000 | At lease signing |
| Monthly rent | $1,500/mo | 12 months = $18,000/yr |
| Lease renewal | $1,500/mo | Ongoing |

Target: 10 applicants = $990 in fees before a single tenant moves in.

---

## NC Legal Resources

- **Standard Lease:** NC Realtors Form 410-T (Revised 7/2023)
  - Source: ncrealtors.org
  - Free PDF — legally reviewed by NC Association of Realtors
- **Fair Housing:** All applications processed equally per NC Fair Housing Act
- **Background Check:** Must have written consent — included in Step 3 payment flow
- **Security Deposit:** NC law caps at 2 months rent = $3,000 max
- **Notice to Vacate:** 30 days written notice required by either party

---

## Virtual Tour Plan

- Current: hero image loads from external Lovable.app URL — needs local replacement
- Next: real photos of 253 Lake Rd replace placeholder images
- Future: full virtual walkthrough embedded in tour.html
- Image replacement timeline: gradual — using Pixelmator Pro + AI tools

---

## Antcoin Bridge

253 Lake Rd is the first real-world asset entering the Antcoin metaverse.
See ANTCOIN_BRIDGE.md for full tokenization roadmap.

Short version:
- Property token minted on antchain — Block #0
- Genesis community watches first real asset enter the chain
- Waitlist becomes early community — not just tenants
- Long term: fractional investment model built around real properties

---

## File Structure
turtle/ ├── index.html ← main site (one page) ├── preview.html ← active preview build ├── live3.html ← daisy chain tracker ├── ANTCOIN_BRIDGE.md ← tokenization roadmap ├── RENTAL_OPS.md ← this file ├── images/ ← site images (replacement in progress) ├── assets/ ← css · js · fonts · sass └── Rental/ ├── 253LakeRd27360.html ← rental listing + application (Step 1) ├── tour.html ← virtual tour (Sprint 2) └── waitlist.html ← waitlist dashboard (Sprint 4)


---

## Sprint Status

- [x] Sprint 0 — Content update · preview.html built
- [x] Sprint 0 — ANTCOIN_BRIDGE.md documented
- [x] Sprint 0 — RENTAL_OPS.md documented
- [ ] Sprint 1 — Wire application form to Discord #applicants
- [ ] Sprint 1 — Add income requirement messaging ($4,500/mo)
- [ ] Sprint 1 — Post-submit virtual tour teaser + 24-48hr response message
- [ ] Sprint 1 — Update move-in cost to $3,000 · 1-year lease
- [ ] Sprint 2 — Build tour.html · virtual tour page
- [ ] Sprint 2 — Replace placeholder images with real property photos
- [ ] Sprint 3 — $99 payment link · background check flow
- [ ] Sprint 4 — Waitlist dashboard · NC lease template · move-in assignment
