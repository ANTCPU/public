# BLOCKCHAIN.md — antcpu Genesis Block
# Visual architecture + network design log
# Operator: Antony Ciccone · @antcpu · 2026
# Created: 2026-05-01

---

## THE VISION

The Genesis Block is not a database entry.
It is a living 3D network — earned, confirmed, sealed.
Each node lights up when a human operator signs.
All 10 confirmed = Genesis Block seals = antcoin goes public.

---

## TECHNOLOGY STACK

- **Pi (π)** — geometric foundation for node positioning
  - Nodes placed using Pi-ratio spacing in 3D space
  - Circle radii, orbital distances, rotation angles all derived from π
  - Pi Network alignment — intentional, philosophical, mathematical
- **SVG** — rendering layer — circles, arcs, glow effects
- **3D transform** — CSS perspective + rotateX/Y for depth
- **antcpu.db** — chain_nodes table feeds live node status
- **Human in the loop** — no node confirms without a real person signing

---

## VISUAL DESIGN

### Node States
| State | Visual | Meaning |
|---|---|---|
| Unconfirmed | Dim hollow circle — grey stroke | Node mapped, not yet signed |
| Pending | Pulsing outline — accent color | Operator notified, awaiting sign |
| Confirmed | Filled circle — glowing | Human signed — node live |
| Genesis Sealed | All 10 lit — network pulses | Block complete — antcoin public |

### Geometry
- 10 nodes arranged in 3D space using π ratios
- Central node = antcpu Genesis (node 0)
- Outer ring = 9 operator nodes — spaced at 2π/9 intervals
- Depth layers — foreground nodes larger, background nodes smaller
- Connection lines between confirmed nodes — draw as each one signs
- Full network pulse animation on Genesis seal

### Color Language
- Unconfirmed: #1a1a1a stroke, transparent fill
- Pending: #D4AF37 pulse (gold — Pi color)
- Confirmed: node accent color — filled + glow
- Sealed: all nodes white pulse — fade to gold

---

## LAYER ARCHITECTURE

  Genesis Block Layer        — visual — SVG 3D network
        ↑
  chain_nodes table          — data — 10 nodes, status per node
        ↑
  ledger table               — financial — mint, allocation, earns
        ↑
  rewards_pool table         — historical earn log — Genesis seed data
        ↑
  agent_daily_log            — performance — scores feed node health

---

## GENESIS BLOCK CONDITIONS

All 3 must be met before seal:

| # | Condition | Status |
|---|---|---|
| 1 | 10,000 testcoin minted | DONE — ledger-genesis-002 |
| 2 | 10 human node operators confirmed | 0/10 |
| 3 | ANT starting price anchored (Pi + BTC) | pending radar-26 |

Seal date target: August 10, 2026

---

## NODE ROSTER — 10 NODES

| Node | Name | Type | Status |
|---|---|---|---|
| 0 | antcpu Genesis | root | planned |
| 1 | antcoin | chain | planned |
| 2 | antcpu cloud | chain | planned |
| 3 | Turtle Enterprises | chain | parked |
| 4 | antcpu EDU | chain | parked |
| 5 | antcpu AI | chain | planned |
| 6 | antcpu TV | loop | building |
| 7 | Amanda Photography | standalone | active |
| 8 | MacBook Pro | asset | active |
| 9 | Android — Node Genesis | genesis | planned |

Node 10 = TV Node — unlocks after WWDC June 2026

---

## BUILD ORDER

1. genesis.html — static scaffold, 10 circles, Pi geometry, CSS 3D
2. Wire chain_nodes table — live node status
3. Confirmation flow — human signs — node lights up — ledger entry
4. Seal animation — all 10 confirmed — Genesis pulse
5. Deploy to antcpu.com/genesis or antchain.vercel.app

---

## ADVERTISING TRIGGER

Do not advertise antcoin until Genesis Block seals.
The network lighting up in real time IS the advertisement.
Show someone the circles confirming one by one.
That is the pitch. No banner needed.

---

## SCORING

- Genesis Block = 100 (antcpu score ceiling)
- Each confirmed node = +10 toward seal
- Each radar item resolved = score contribution
- Agent performance feeds node health display

---

## NOTES

- This is 3D chess — Pi in the math, Pi in the network name, Pi in the geometry
- The visual is the product demo
- Keep it elegant — fewer elements, more meaning
- Every circle earned, not placed

---

Updated: 2026-05-01
