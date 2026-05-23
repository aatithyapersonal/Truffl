# Architecture Clarifications

Date: 2026-05-23

This document captures the product and architecture direction clarified after the initial Voice OS architecture draft.

## Product Definition

Truffl is a merchant-facing SaaS product for configuring, running, and observing AI voice recovery journeys.

The core product is not a browser extension, Codex plugin, or Shopify-only plugin. The core product is:

- A Truffl web dashboard.
- A store connector layer.
- A journey configuration and orchestration backend.
- A real outbound voice execution stack.
- WhatsApp and CRM follow-up connectors.
- Attribution and operations visibility.

Shopify is the first store connector and first install surface. Merchants may discover or install Truffl through a Shopify app, but the app should launch or redirect into the Truffl dashboard where the main setup and operations experience lives.

## Merchant Onboarding Journey

The ideal merchant flow is:

1. Merchant finds Truffl through Shopify App Store, a direct invite, or outbound sales.
2. Merchant installs the Shopify app or connects a store from inside Truffl.
3. Shopify grants required scopes and redirects the merchant to Truffl.
4. Truffl creates or finds the merchant organization and brand.
5. Truffl shows connector health: store connected, webhooks active, data permissions, phone data availability, order attribution readiness.
6. Merchant enters the chat-driven journey setup screen.
7. Merchant describes the desired voice journey in plain English.
8. Truffl converts the conversation into draft journey configuration.
9. Merchant reviews visual configuration, test calls, sample cart simulation, compliance warnings, and expected behavior.
10. Merchant publishes the journey.

The Shopify app is therefore a connector and launch surface. The Truffl dashboard is the product home.

## Store Connector Strategy

Start with Shopify, but design around a platform-neutral store connector contract from day one.

### What "Any Store" Means

Truffl can support any ecommerce store if that store can provide the required commerce events and recovery fields through at least one supported integration method.

Required minimum contract:

- Store identity.
- Customer or visitor contact fields when available.
- Cart or checkout created/updated event.
- Cart items, quantities, prices, currency, and product identifiers.
- Cart or checkout recovery URL.
- Order created/paid event.
- Enough identifiers to match orders back to carts, such as checkout token, cart token, customer ID, email, phone, or custom attribution token.
- Product catalog or enough item metadata to create safe voice context.

If a store cannot provide these, Truffl can still ingest uploads or API pushes, but real-time automation quality will be lower.

### Integration Modes

| Mode | Best for | How it works | Tradeoff |
| --- | --- | --- | --- |
| Native app/plugin | Shopify, WooCommerce | Merchant installs app/plugin, grants permissions, webhooks are registered automatically | Best UX, platform-specific work |
| Server webhooks/API | Custom stores, headless commerce | Store sends normalized events to Truffl endpoints | Flexible, requires merchant engineering |
| JavaScript pixel/script | Stores without good server hooks | Script observes browse/add-to-cart/checkout signals and sends first-party events | Useful but less reliable, privacy-sensitive, may miss server-side order facts |
| CSV/manual import | Backfill, pilots, debugging | Merchant uploads abandoned carts/orders/products | Not real-time, not suitable as main automation path |

### Shopify V1 Connector

For Shopify, Truffl should use:

- Shopify app installation for store connection.
- Offline access token for background work.
- Webhooks for `checkouts/create`, `checkouts/update`, `orders/create`, `orders/updated`, and `app/uninstalled`.
- GraphQL `abandonedCheckouts` for backfill, recovery URL reconciliation, and debugging.
- Internal abandonment detection: checkout event received, wait configured window, verify no order, then create internal `cart_abandoned`.

Shopify does not guarantee that every checkout has a phone number. Email, phone, name, address, orders, and abandoned checkouts are protected customer data, so the product must be designed for missing or redacted fields.

### WooCommerce And Custom Store Readiness

WooCommerce should be the second platform because it has plugin and webhook paths.

Custom stores should use the same normalized contract through:

- Signed server webhooks.
- REST API event ingestion.
- Optional JavaScript pixel for client-side cart signals.
- Optional SDKs later.

The connector layer should normalize every platform into the same internal events, not leak Shopify-specific structures into the journey engine.

## Multi-Country And Multi-Currency

Multi-country and multi-currency support is required from day one.

Rules:

- Store money in minor units plus ISO currency code, for example `amount_minor=1000000`, `currency=INR`.
- Never store a bare `cart_value` without currency.
- Brand thresholds are configurable per currency and optionally per market.
- Store brand timezone, default country, supported countries, and supported currencies.
- Phone numbers must be normalized to E.164 where possible.
- Voice provider routing must be country-aware because call legality, deliverability, caller ID, and pricing differ by market.
- Dashboard revenue must show original currency and optional normalized reporting currency.

High-AOV is therefore not hardcoded as INR 10000. It is a brand journey setting such as:

```json
{
  "thresholds": [
    { "currency": "INR", "amount_minor": 1000000 },
    { "currency": "USD", "amount_minor": 15000 }
  ]
}
```

## Product-Agnostic Journey Setup

The system must work for D2C brands across categories.

Do not hardcode mattresses, furniture, electronics, jewelry, or any product category into the journey engine.

Instead, represent product knowledge through:

- Product catalog ingestion.
- Product type, tags, collections, vendor, price, variants, and images.
- Brand-uploaded FAQs, shipping policies, return policies, warranty policies, sizing guides, offer rules, and objection handling notes.
- Brand-configured high-consideration products, collections, tags, or price bands.
- Later: AI-assisted product classification, always reviewed before activation.

The agent compiler should produce product-specific conversations from structured brand knowledge, not from category-specific code.

## First Screen: Chat-Driven Journey Setup

The first screen should feel like Cursor for voice bots and recovery journeys.

Primary layout:

- Chat panel where the merchant describes requirements in plain English.
- Live visual canvas that turns chat into configuration as the conversation progresses.
- Preview tabs or panels for Journey Setup, Voice Agent, Store Connector, Operations Queue, Revenue/Attribution, Compliance, and Debug.
- Publish controls that require explicit review before real calls are enabled.

Visual feedback examples:

- Journey flow graph appears and changes as the merchant explains the journey.
- Eligibility rules appear as editable cards.
- Thresholds, countries, currencies, and quiet hours appear as config controls.
- Voice agent script/guardrails update live.
- Required missing data appears as warnings, such as "phone is not always available from Shopify".
- Sample carts run through the journey simulator.
- A mock operations queue shows how real carts would move through states.
- Attribution preview shows how recovered revenue will be matched.
- Debug panel shows normalized event contracts and provider calls for founder/admin use.

Under the hood, chat does not directly mutate live journeys. It creates draft configuration patches:

- `journey_draft`
- `config_patch`
- `validation_issue`
- `simulation_run`
- `publish_request`

This protects merchants from accidentally launching bad journeys while preserving the magical setup experience.

## Real Voice Call Stack

The MVP should actually place calls, not only simulate calls.

Voice is the foundation of Truffl. Store connectors, dashboards, WhatsApp, CRM, and attribution all support the core voice recovery loop. The system should therefore treat call placement, live voice runtime, handoff, call state, transcript capture, outcome extraction, and post-call actioning as first-class architecture, not late integrations.

However, the architecture should keep telephony, real-time voice intelligence, transcription, synthesis, and LLM reasoning separated behind adapters.

### Provider Categories

| Layer | Role | Candidate providers |
| --- | --- | --- |
| Telephony/PSTN | Place outbound calls, manage caller ID, receive call status, record calls | Exotel, Twilio, Plivo, regional carriers |
| Media streaming/SIP | Stream live call audio to voice runtime | Exotel AgentStream, Twilio Media Streams, SIP trunking |
| Realtime voice model | Low-latency speech-to-speech or audio conversation intelligence | OpenAI Realtime API or equivalent |
| STT fallback | Transcribe recordings or non-realtime audio | OpenAI transcription models or equivalent |
| TTS fallback | Generate spoken prompts if not using speech-to-speech | OpenAI TTS or equivalent |
| LLM reasoning | Outcome extraction, journey setup interpretation, guardrail checks | OpenAI text models or equivalent |
| WhatsApp | Cart links, post-call follow-up, missed-call follow-up | Meta Cloud API, Interakt, WATI, Zoko, Gupshup |
| CRM/logging | Pilot outcome sink | Google Sheets first, then HubSpot/Zoho/LeadSquared |

Provider direction:

- India telephony first: Plivo.
- Broader/global telephony: Twilio.
- Provider adapters remain mandatory so country routing can change without changing journey logic.
- Real calls are enabled for controlled test numbers before pilot traffic.
- AI disclosure is configurable but off by default for the initial India pilot unless legal/compliance review requires otherwise.
- Call recordings and transcripts are retained for 3 months by default, then deleted or anonymized according to the retention job.

### Voice Architecture

Recommended abstraction:

```txt
Journey Orchestrator
  -> VoiceCallService
    -> TelephonyAdapter
    -> VoiceSessionRuntime
      -> RealtimeModelAdapter
      -> ToolExecutor
      -> GuardrailEngine
      -> TranscriptRecorder
    -> OutcomeExtractor
```

Call flow:

1. Worker decides `call_now`.
2. VoiceCallService creates a call attempt.
3. TelephonyAdapter places the outbound call.
4. When answered, the call media is connected to VoiceSessionRuntime.
5. VoiceSessionRuntime runs the AI conversation, tools, configurable disclosures, and handoff rules.
6. Provider callbacks update call status.
7. Transcript and recording are stored.
8. OutcomeExtractor writes structured outcome.
9. WhatsApp/CRM/attribution jobs run.

Important design rule: telephony provider choice must not control the journey engine. If Plivo is best for India and Twilio is best for another market, the same journey should work through provider adapters.

India v1 uses Plivo by default. Twilio remains the preferred global fallback/broader-market adapter.

## Human Handoff

Human handoff is part of v1 architecture.

Two handoff modes are required:

- Telephony handoff: transfer or bridge the live call to a merchant-side human number, support queue, or sales rep when the buyer is high-intent or asks for a person.
- CRM/ops handoff: create a hot lead, update CRM/Sheets, notify the merchant, and show the item in the operations queue.

The voice agent should be able to trigger handoff through a guarded tool call. The tool should check brand configuration, business hours, available destination numbers, handoff reason, and country/provider capability before transferring.

Handoff outcomes should be tracked separately from AI-only outcomes so we can measure how much revenue came from AI closure versus human-assisted closure.

## Production Readiness Stance

Build for production from day one, but deliver through thin vertical slices.

Production-ready does not mean creating premature microservices. It means every early decision should survive serious usage:

- Environment separation: local, staging, production.
- Managed production database with backups and migrations.
- Durable queue and worker model.
- Always-on API and worker services for webhooks, calls, and retries.
- Secrets in a real secret manager, never local files or repo.
- Object storage for recordings, transcripts, exports, and large payloads.
- Structured logs, metrics, traces, and alerts.
- Audit logs for sensitive actions.
- Role-based access control from the start.
- Data retention jobs, including 3-month voice recording/transcript retention.
- Provider abstraction and idempotency for every external side effect.

Recommended production baseline:

- Cloud: AWS first, with infrastructure kept portable enough to move later if needed.
- App runtime: ECS Fargate or equivalent container runtime for API, worker, and voice runtime.
- Database: Amazon RDS PostgreSQL.
- Queue/cache: Amazon ElastiCache for Redis.
- Object storage: S3.
- Secrets: AWS Secrets Manager.
- Observability: CloudWatch plus OpenTelemetry-compatible app instrumentation.
- Network/security: VPC, private database/cache subnets, TLS everywhere, least-privilege IAM, KMS encryption, WAF/ALB where appropriate.

Vercel can still be considered for the marketing site or dashboard frontend if useful, but it should not be the core runtime for voice sessions, long-running workers, webhook orchestration, or provider callbacks.

### Development Tooling Baseline

The local development environment should mirror the production shape where it matters:

- Node.js 24 LTS.
- pnpm 11 workspaces through Corepack.
- Docker-managed Postgres and Redis for local stateful services.
- Prisma migrations for database evolution.
- Real provider adapters behind interfaces, with dry-run implementations only as controlled substitutes.

Do not design around missing tools. If Docker, Node 24, pnpm, provider credentials, or cloud accounts are missing, install or create them instead of weakening the architecture.

## Build Strategy

Frontend and backend should be built hand in hand through vertical slices.

Do not build the entire frontend first or the entire backend first.

Recommended sequence:

1. Build the dashboard shell and chat-driven journey setup mock with fake data.
2. In parallel, build the real data model for merchant organizations, brands, markets, journey drafts, connectors, and provider accounts.
3. Connect the setup UI to draft configuration APIs.
4. Add a simulator that sends fake store events through the real backend path.
5. Add Plivo test-call capability for controlled numbers.
6. Add voice runtime and outcome extraction.
7. Add Shopify development-store connector.
8. Add operations queue, attribution, WhatsApp, and CRM handoff.

This keeps the magical product surface visible early while making sure every visual element is gradually backed by real system behavior.

## WhatsApp Ownership Modes

Truffl must support both:

1. Truffl-managed WhatsApp: Truffl owns the provider account/number, faster for pilots but less merchant-branded.
2. Merchant-owned WhatsApp: merchant connects their WABA/provider account, better brand trust and long-term ownership.

Data model should include `ownership_mode`, provider account references, template status, template language, quality status when available, and fallback behavior when WhatsApp cannot send.

## Consent And Compliance

Pilot assumption:

- Merchant provides a transactional outreach basis for abandoned checkout recovery.

Architecture requirement:

- Build consent and suppression fields now even if enforcement is basic in pilot.
- Store `phone_consent_status`, `sms_whatsapp_consent_status`, `marketing_email_consent_status`, `do_not_call`, `opted_out_at`, and source.
- Support country-specific quiet hours and calling rules.
- Support configurable AI disclosure in voice calls when required; default off for the first India pilot.
- Support opt-out capture from calls and WhatsApp.

## Data Model Additions

Add or extend these concepts in the build-level schema:

- `merchant_organizations`
- `brands`
- `brand_markets`
- `store_connectors`
- `store_connector_capabilities`
- `store_event_sources`
- `journey_configs`
- `journey_drafts`
- `config_patches`
- `simulation_runs`
- `brand_knowledge_sources`
- `brand_knowledge_snapshots`
- `voice_provider_accounts`
- `whatsapp_provider_accounts`
- `consent_records`
- `suppression_records`
- `call_attempts`
- `voice_sessions`
- `transcript_segments`
- `message_attempts`
- `attribution_matches`

## Revised Build Order

1. Keep version control and docs current.
2. Build Truffl dashboard shell with chat-driven journey setup mock.
3. Build core data model for brands, markets, connectors, journey drafts, and published journey configs.
4. Build normalized store connector contract.
5. Connect chat-driven setup UI to real draft journey APIs.
6. Build simulator that sends fake store events through the real backend path.
7. Build product-agnostic High-AOV New Buyer eligibility with brand-configured thresholds.
8. Build real outbound call attempt to controlled test numbers through Plivo for India.
9. Add voice runtime integration and outcome extraction.
10. Build Shopify connector against a development store.
11. Ingest Shopify checkout/order webhooks and abandoned checkout backfill.
12. Add telephony and CRM/ops human handoff.
13. Add WhatsApp follow-up with both ownership modes modeled, one provider active first.
14. Add attribution and operations dashboard.
15. Add WooCommerce connector and custom store webhook/API connector.

## Open Questions

- Which exact Plivo account and Indian caller ID path should we use for test calls?
- Which WhatsApp provider should be active first while keeping both ownership modes in the model?
- Should the first deploy use AWS ECS Fargate directly, or start with a simpler AWS container service while preserving the same architecture?
- What merchant notification channels should CRM/ops handoff use first: dashboard only, email, Slack, WhatsApp, or CRM task?
- Which development Shopify store should we create for integration testing?
- Which specific co-founder identity provider/login method should we use first?

## References Checked

- Shopify webhooks and Events: https://shopify.dev/docs/apps/build/events-webhooks
- Shopify webhook topics and payloads: https://shopify.dev/docs/api/admin-rest/latest/resources/webhook
- Shopify abandoned checkouts: https://shopify.dev/docs/api/admin-graphql/latest/queries/abandonedCheckouts
- Shopify protected customer data: https://shopify.dev/docs/apps/launch/protected-customer-data
- Shopify managed installation: https://shopify.dev/docs/apps/build/authentication-authorization/app-installation
- WooCommerce webhooks: https://developer.woocommerce.com/docs/apis/rest-api/v2/webhooks/
- OpenAI Realtime API: https://platform.openai.com/docs/guides/realtime
- OpenAI speech-to-text: https://platform.openai.com/docs/guides/speech-to-text
- OpenAI text-to-speech: https://platform.openai.com/docs/guides/text-to-speech
- WhatsApp Cloud API Node.js SDK: https://whatsapp.github.io/WhatsApp-Nodejs-SDK/
- Plivo outbound calls: https://docs.plivo.com/docs/voice/api/call/make-a-call/
- Plivo call transfer: https://docs.plivo.com/docs/voice/api/call/transfer-a-call
- Plivo call recording: https://docs.plivo.com/docs/voice/use-cases/record-a-call
- Twilio Programmable Voice: https://www.twilio.com/docs/voice
- Twilio Voice API: https://www.twilio.com/docs/voice/api
- AWS ECS Fargate: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/AWS_Fargate.html
- AWS RDS PostgreSQL: https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html
- AWS ElastiCache for Redis: https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/WhatIs.html
- AWS Secrets Manager: https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html
- S3 lifecycle configuration: https://docs.aws.amazon.com/AmazonS3/latest/userguide/object-lifecycle-mgmt.html
