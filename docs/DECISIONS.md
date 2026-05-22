# Decision Log

Use this file to record meaningful project decisions.

Each decision should include:

- Date.
- Decision.
- Context.
- Options considered.
- Rationale.
- Follow-up required.

## 2026-05-23: Start With High-AOV New Buyer Journey

Decision:

Build the first Voice OS abandoned-cart journey around High-AOV New Buyer recovery.

Context:

The full PRD includes five abandoned-cart journeys. Building all five at once would slow validation and increase integration risk.

Rationale:

High-AOV carts justify voice outreach because the recovery upside is high enough to support call cost and operational complexity. The journey also has clear eligibility rules: first-time buyer, cart value above INR 10000, phone available, high-consideration category, and no purchase after the waiting window.

Follow-up:

Build the local journey simulator first, then add Shopify ingestion and live provider integrations.

## 2026-05-23: Use Modular Monolith for MVP

Decision:

Use a modular monolith for the first build instead of microservices.

Context:

Voice OS has many conceptual modules: connector hub, event listener, context builder, suppression, decisioning, agent compiler, voice, WhatsApp, CRM, attribution, and dashboard.

Rationale:

The workflow is still evolving. Splitting into microservices now would add coordination overhead without proving product value. A modular monolith keeps the architecture clean while allowing faster iteration.

Follow-up:

Keep internal module boundaries clear so future service extraction remains possible.

## 2026-05-23: Use Git From Project Start

Decision:

Initialize Git immediately in the real project folder.

Context:

The project already has architecture docs and implementation decisions worth tracking.

Rationale:

Git creates clean history, protects against accidental loss, and makes later collaboration with GitHub straightforward.

Follow-up:

Create private GitHub remote and push `main`.
