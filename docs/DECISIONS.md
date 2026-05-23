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

## 2026-05-23: Truffl Dashboard Is The Product Home

Decision:

Build Truffl as a separate merchant-facing SaaS dashboard. Shopify is the first connector and install surface, not the whole product.

Context:

Merchants should be able to discover/install through Shopify, but the main setup and operations experience should live in Truffl. This keeps the product extensible beyond Shopify.

Rationale:

The long-term product must support Shopify, WooCommerce, custom stores, and future ecommerce platforms. A Truffl-owned dashboard gives us one consistent setup, operations, attribution, and debugging surface.

Follow-up:

Design the Shopify install-to-Truffl handoff and build merchant organization/auth concepts before live integrations.

## 2026-05-23: Shopify First, Any Store Through Connector Contract

Decision:

Start with Shopify, but define a normalized store connector contract from day one.

Context:

The product must eventually support WooCommerce, custom stores, and other ecommerce systems. "Any store" requires a clear data contract rather than one-off code paths.

Rationale:

If every platform maps to normalized cart, checkout, order, customer, product, and recovery-link events, the journey engine can remain platform-agnostic.

Follow-up:

Implement Shopify first, then WooCommerce and custom webhook/API ingestion against the same contract.

## 2026-05-23: Multi-Country And Multi-Currency From Day One

Decision:

Store all money as minor units plus currency and make High-AOV thresholds configurable per brand, currency, and market.

Context:

The first pilot store is not fixed yet, and Truffl should not be India-only or INR-only.

Rationale:

Retrofitting multi-currency later would touch decisioning, attribution, dashboards, provider routing, and reporting.

Follow-up:

Add brand market configuration to the data model before implementing decision rules.

## 2026-05-23: Real Calls In MVP With Provider Adapters

Decision:

The MVP should actually place calls, but telephony, media streaming, realtime voice intelligence, transcription, TTS, and LLM reasoning must sit behind provider adapters.

Context:

Simulation is useful for setup and QA, but Voice OS must prove real recovery behavior.

Rationale:

Provider choices will vary by country, cost, compliance, and call quality. Adapter boundaries let us test Exotel, Twilio, Plivo, OpenAI Realtime, WhatsApp providers, and CRM sinks without rewriting the journey engine.

Follow-up:

Choose the first calling country and first telephony provider for test calls.

## 2026-05-23: Chat-Driven Journey Setup First Screen

Decision:

The first dashboard screen should be a chat-driven journey setup experience with live visual configuration feedback.

Context:

The merchant should describe requirements in plain English and see Truffl turn that into journey rules, voice agent behavior, provider setup, operations previews, attribution logic, and validation warnings.

Rationale:

This creates the "Cursor for voice bots and recovery journeys" feeling while still keeping live calls behind review and publish controls.

Follow-up:

Build draft journey configuration, config patches, validation issues, and simulation runs before real publish flows.
