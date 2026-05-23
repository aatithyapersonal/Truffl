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

Provider choices will vary by country, cost, compliance, and call quality. Adapter boundaries let us test Plivo, Twilio, OpenAI Realtime, WhatsApp providers, and CRM sinks without rewriting the journey engine.

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

## 2026-05-23: India First Calling Market With Plivo

Decision:

Use India as the first real calling market. Use Plivo for India telephony and Twilio as the broader/global telephony path.

Context:

The first pilot market should be explicit because calling rules, caller ID, cost, deliverability, provider support, and handoff behavior vary by country.

Rationale:

India-first testing keeps the first real voice loop focused. Plivo is the chosen India provider, while Twilio remains useful for broader/global coverage.

Follow-up:

Create the Plivo adapter first and test outbound calls to controlled numbers before live merchant traffic.

## 2026-05-23: AWS-First Production Baseline

Decision:

Use an AWS-first production baseline for core runtime: containerized API, worker, and voice runtime; managed PostgreSQL; managed Redis; S3 object storage; Secrets Manager; production observability.

Context:

Voice is the foundation of the product, and serious production use requires always-on workers, webhook processing, provider callbacks, long-running call sessions, durable storage, and secure secret handling.

Rationale:

Vercel-style frontend/serverless deployments can be useful, but they should not own the core voice and workflow runtime. AWS gives a more durable production shape from day one without forcing microservices.

Follow-up:

Keep local development simple with Docker Compose while designing deployable services around AWS containers and managed data services.

## 2026-05-23: Human Handoff Is V1 Architecture

Decision:

Support both telephony handoff and CRM/ops handoff in the first real-call architecture.

Context:

High-intent buyers may need a human sales/support person, and merchants need to know when a cart needs intervention.

Rationale:

Handoff makes the AI safer and more commercially useful. It also creates a measurable distinction between AI-resolved and human-assisted recovery.

Follow-up:

Add handoff destination configuration, handoff reason capture, CRM task/update support, and operations queue visibility.

## 2026-05-23: Voice Data Retention Is Three Months

Decision:

Retain call recordings and transcripts for 3 months by default.

Context:

Recordings and transcripts are useful for QA, debugging, outcome extraction, merchant trust, and dispute review, but they are sensitive customer data.

Rationale:

A 3-month retention window balances operational usefulness with privacy risk.

Follow-up:

Implement retention jobs and storage lifecycle policy before storing production call recordings.

## 2026-05-23: Co-Founder Has Full Access

Decision:

The co-founder should have full access across product, dashboard, comments/review, and code-level inspection if needed.

Context:

She will not be executing technical work day to day, but she should be able to inspect, comment, and understand any part of the system.

Rationale:

Full visibility prevents founder knowledge silos and supports product/business review.

Follow-up:

Represent this as an owner/admin role with audit logging, not a limited viewer role.

## 2026-05-23: Build Frontend And Backend Through Vertical Slices

Decision:

Build the chat-driven dashboard and backend foundation hand in hand through thin vertical slices.

Context:

The setup screen is a defining product experience, but it should not become a disconnected mock. The backend is core, but building only backend first would delay product learning.

Rationale:

Vertical slices let the UI, data model, journey drafts, simulator, voice calls, and operations queue mature together.

Follow-up:

Start with dashboard shell plus real draft configuration APIs, then add simulator and Plivo test calls.

## 2026-05-23: AI Disclosure Configurable, Off By Default For India Pilot

Decision:

Do not include an AI disclosure at the start of calls by default for the initial India pilot, but keep disclosure behavior configurable by brand, country, and legal requirement.

Context:

The product should optimize for natural recovery calls during the pilot, while preserving future compliance flexibility.

Rationale:

Disclosure requirements and brand preferences can vary by market. Making it configurable avoids hardcoding either a disclosure-first or no-disclosure stance.

Follow-up:

Represent disclosure behavior in journey/market configuration and keep it off for the first India test unless legal review changes that.

## 2026-05-23: Support Both WhatsApp Ownership Modes

Decision:

Support both Truffl-managed and merchant-owned WhatsApp modes in the architecture.

Context:

Truffl-managed WhatsApp can speed up pilots. Merchant-owned WhatsApp gives better brand trust and long-term control.

Rationale:

Both modes will be needed for different customer segments, so the data model should support both even if only one provider path is activated first.

Follow-up:

Model provider account ownership, template status, phone number identity, and fallback behavior before live WhatsApp follow-up.
