# Voice Agent Intelligence Layer

Date: 2026-05-26

This is the core Truffl product direction.

Truffl is a conversational platform that turns a user's natural-language business goal into a testable, configurable, and eventually deployable voice agent. Ecommerce abandoned-cart recovery is one journey template inside the platform, not the entire product.

The first iteration should use production-grade core architecture with simulated external edges where needed. Real integrations such as Shopify, Plivo, Twilio, Meta, AWS, and CRMs can be added behind adapters after the core builder loop works.

## Core Loop

1. User describes the use case in chat.
2. Truffl extracts requirements, assumptions, missing details, variables, data needs, and risk areas.
3. Truffl asks targeted follow-up questions only when needed.
4. Truffl generates a structured voice-agent specification.
5. Truffl builds or updates knowledge sources, test cases, scripts, prompts, tools, and workflow rules.
6. User tests the agent in a simulator.
7. User continues chatting to refine behavior.
8. Truffl produces a deployment-ready plan, initially simulated and later backed by real providers.

The chat should feel like Cursor: it should be conversational, task-oriented, and transparent about progress. It should say what it changed, what is now ready, what is blocked, and what sensible next actions are available.

## Intelligence Layer Responsibilities

The intelligence layer must produce and maintain these artifacts:

| Artifact | Purpose |
| --- | --- |
| Use case brief | Plain-English summary of what the user wants the agent to do. |
| Agent spec | Structured source of truth for the voice agent. |
| Variable schema | Custom variables the agent can read, ask for, write, or compute. |
| Contact/data schema | Required and optional fields for uploaded leads/customers/carts. |
| Knowledge plan | Sources to crawl, upload, parse, or ask the user for. |
| Knowledgebase | Parsed, chunked, indexed, and cited brand/domain knowledge. |
| Prompt stack | System prompt, role prompt, task prompt, policy prompt, and tool instructions. |
| Conversation design | Script, states, transitions, objection handling, and fallback behavior. |
| Tool plan | Tools the agent can call, with permissions and failure modes. |
| Provider plan | STT, LLM, TTS, telephony, recording, storage, and analytics choices. |
| Test suite | Simulated calls, edge cases, bad inputs, and expected outcomes. |
| Deployment plan | What is ready, what is simulated, what needs real credentials, and rollout gates. |
| Analytics plan | Events, metrics, recordings, transcripts, outcomes, and attribution. |

## Custom Variables

Every agent must support custom variables from day one.

Variable examples:

- `customer_name`
- `phone_number`
- `email`
- `cart_value`
- `currency`
- `product_names`
- `last_order_date`
- `preferred_language`
- `city`
- `lead_source`
- `appointment_slot`
- `sales_owner`
- `discount_code`
- `recovery_url`
- `risk_score`
- `handoff_reason`

Each variable needs:

- Name.
- Type.
- Description.
- Source: uploaded data, connector, user input, inferred value, API lookup, agent-collected value, or computed value.
- Required/optional status.
- Default value or fallback behavior.
- Validation rules.
- Privacy sensitivity.
- Whether the agent may speak it aloud.
- Whether the agent may write/update it.
- Whether it appears in analytics.

The builder should infer variables from the user's chat and show them as live configuration. Example: if the user says "call high-value abandoned cart users and offer them a 10 percent coupon," Truffl should propose variables such as `cart_value`, `currency`, `coupon_code`, `recovery_url`, `customer_name`, and `phone_number`.

## Uploaded Customer And Lead Data

Truffl must support user-provided data files before real store integrations are mandatory.

Supported first formats:

- CSV.
- XLSX or Google Sheets export.
- PDF.
- Plain text.
- JSON.
- Later: CRM exports, ecommerce exports, and direct connectors.

The upload flow should:

1. Detect columns/fields.
2. Infer field meanings.
3. Ask the user to confirm mappings.
4. Identify missing required fields.
5. Validate phone numbers, emails, countries, currencies, dates, and amounts.
6. Deduplicate records.
7. Segment records into call queues.
8. Show a preview before any calls are placed.
9. Run in simulator mode first.

Minimum useful contact fields:

- Customer name.
- Phone number.
- Email fallback.
- Country.
- Language preference if available.
- Use-case-specific fields such as cart value, product name, order date, appointment date, lead stage, or ticket reason.

For abandoned cart, uploaded data can stand in for Shopify:

- Customer/contact info.
- Product/cart summary.
- Cart value and currency.
- Recovery URL if available.
- Timestamp of abandonment.
- Tags or segment labels.

## Knowledgebase Builder

The builder should be able to create knowledge from:

- User chat.
- Uploaded files.
- Website pages.
- Product pages.
- FAQ pages.
- Shipping, return, warranty, cancellation, pricing, and offer policies.
- Public online information the user approves.
- Manually entered notes.
- Later: store catalogs, CRMs, support docs, reviews, and previous call transcripts.

Knowledge handling needs:

- Source tracking.
- Chunking.
- Embeddings or retrieval index.
- Last-crawled timestamps.
- Confidence/source quality labels.
- Conflict detection.
- Missing-knowledge questions.
- Safe-answer rules when knowledge is absent.
- Citation/debug view for why the agent answered something.

## Voice Agent Component Inventory

A strong voice agent is not just a prompt. The intelligence layer should reason about each component below.

### Goal And Success

- Primary goal.
- Secondary goals.
- Hard stop conditions.
- Conversion event.
- Success metrics.
- Failure states.
- Human review requirements.

### Audience And Context

- Who the agent calls.
- Why the person is being contacted.
- What the person likely knows.
- What data the agent has before the call.
- What data the agent should collect during the call.
- Sensitivity level of the conversation.

### Conversation Design

- Opening.
- Consent/disclosure line if needed.
- Identity and context verification.
- Value proposition.
- Discovery questions.
- Objection handling.
- Product or policy explanation.
- Offer/CTA.
- Scheduling or recovery link step.
- Handoff step.
- Closing.
- Retry language.
- Fallback when the user is angry, busy, confused, silent, or asks for a human.

### Policy And Guardrails

- What the agent can say.
- What the agent cannot say.
- Required disclosures.
- Brand tone.
- Compliance constraints.
- Price/discount boundaries.
- Medical, legal, financial, or sensitive claims.
- Data privacy restrictions.
- Consent and opt-out handling.

### State Machine

- Call not started.
- Dialing.
- Connected.
- Wrong number.
- Busy.
- Voicemail.
- Interested.
- Needs more info.
- Objection raised.
- Human handoff requested.
- Follow-up requested.
- Converted.
- Not interested.
- Do not contact.
- Failed.

### Tools

- Search knowledgebase.
- Look up customer record.
- Update contact fields.
- Send link by WhatsApp/SMS/email.
- Create CRM note/task.
- Schedule callback.
- Transfer call.
- Apply offer.
- Mark opt-out.
- Escalate to human.
- Log outcome.

Each tool needs permission, inputs, outputs, error handling, retry rules, and audit logging.

### Voice Runtime Choices

- Telephony provider.
- Caller ID strategy.
- Call recording setting.
- STT provider.
- TTS provider.
- Realtime model or STT+LLM+TTS pipeline.
- Latency target.
- Interruption/barge-in handling.
- Silence handling.
- Background noise tolerance.
- Language/accent handling.
- Fallback when audio quality is bad.

### Testing

- Happy path.
- Busy customer.
- Angry customer.
- Wrong number.
- No phone number.
- Missing variable.
- Conflicting knowledge.
- Customer asks something outside scope.
- Customer asks for human.
- Customer requests opt-out.
- Customer says yes but link delivery fails.
- Long silence.
- Repeated interruptions.

### Analytics And Recording

Analytics must exist from basic to advanced.

Basic:

- Calls attempted.
- Calls connected.
- Call duration.
- Outcome.
- Conversion/recovery.
- Follow-up sent.
- Human handoff count.
- Failed calls and reasons.
- Recordings and transcripts.

Intermediate:

- Objection categories.
- Agent talk/listen ratio.
- Drop-off points.
- Sentiment or intent labels.
- Knowledge gaps.
- Script sections that work/fail.
- Segment-level performance.
- Provider cost per outcome.

Advanced:

- Prompt/version performance.
- A/B tests.
- Agent quality scores.
- Compliance review flags.
- Auto-discovered objections.
- Revenue attribution.
- Cohort performance.
- Human handoff performance.
- Recommended improvements.

Recordings and transcripts should have retention, redaction, access control, and audit logs.

## Product UI

The first screen should be a builder workspace, not a settings dashboard.

Recommended layout:

- Left or center: conversational builder chat.
- Right: live agent spec preview.
- Tabs or panels: Variables, Knowledge, Script, Tools, Test Calls, Data Upload, Analytics, Deployment.
- Bottom/side: task progress and validation warnings.

The assistant must not just answer. It should act and report:

- "I drafted the opening script."
- "I found three required variables."
- "I mapped your CSV columns."
- "I created five test scenarios."
- "I found one missing item before deployment: caller ID."
- "Next we can test the call, upload contacts, or adjust tone."

## MVP Priority

Build first:

1. Conversational builder chat.
2. Structured agent spec generator.
3. Custom variable extraction and editor.
4. CSV/XLSX upload parser and contact-list simulator.
5. Knowledge source planner with manual/URL inputs.
6. Prompt/script/rules generator.
7. Text-based call simulator.
8. Basic call analytics simulator.
9. Abandoned-cart template as the first example journey.

Defer:

- Live Shopify ingestion.
- Live Plivo/Twilio calls.
- Real WhatsApp sending.
- Real CRM updates.
- Production cloud deployment.

These are adapter edges. They matter, but they should not block the intelligence layer.
