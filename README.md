# Voice OS

Voice OS is a D2C abandoned-cart recovery system focused first on the **High-AOV New Buyer** journey.

The MVP goal is to detect high-value abandoned Shopify carts, decide whether voice outreach is appropriate, generate a safe product-specific call plan, trigger voice and WhatsApp follow-up, write CRM outcomes, and attribute recovered revenue.

## Current Artifacts

- [VoiceOS_High_AOV_Architecture.md](./VoiceOS_High_AOV_Architecture.md): product and system architecture for the reusable Voice OS spine and first journey.
- [VoiceOS_Build_Level_Architecture.md](./VoiceOS_Build_Level_Architecture.md): implementation-level architecture covering stack, services, database, queues, APIs, provider adapters, and build milestones.

## MVP Focus

First journey:

**High-AOV New Buyer Cart Recovery**

Initial build path:

1. Local journey simulator.
2. Shopify abandoned checkout ingestion.
3. Rule-based High-AOV decision engine.
4. Agent plan compiler.
5. Mock voice, WhatsApp, CRM, and attribution.
6. Live provider integrations for pilot.

## Version Control

This project uses Git from the start. Keep commits small and tied to meaningful product/build milestones.

Never commit provider secrets, Shopify tokens, WhatsApp credentials, voice API keys, or local `.env` files.
