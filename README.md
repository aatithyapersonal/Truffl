# Voice OS

Voice OS is a D2C abandoned-cart recovery system focused first on the **High-AOV New Buyer** journey.

The MVP goal is to detect high-value abandoned Shopify carts, decide whether voice outreach is appropriate, generate a safe product-specific call plan, trigger voice and WhatsApp follow-up, write CRM outcomes, and attribute recovered revenue.

Current product direction: Truffl is a merchant-facing web dashboard with store connectors. Shopify is the first connector and install surface, while the architecture stays ready for WooCommerce and custom stores through a normalized connector contract. See [docs/ARCHITECTURE_CLARIFICATIONS.md](docs/ARCHITECTURE_CLARIFICATIONS.md).

## Current Artifacts

- [VoiceOS_High_AOV_Architecture.md](./VoiceOS_High_AOV_Architecture.md): product and system architecture for the reusable Voice OS spine and first journey.
- [VoiceOS_Build_Level_Architecture.md](./VoiceOS_Build_Level_Architecture.md): implementation-level architecture covering stack, services, database, queues, APIs, provider adapters, and build milestones.
- [docs/ARCHITECTURE_CLARIFICATIONS.md](./docs/ARCHITECTURE_CLARIFICATIONS.md): current product decisions for Truffl dashboard, store connectors, production voice architecture, and build order.
- [docs/SERVICE_SETUP.md](./docs/SERVICE_SETUP.md): required local tools, service accounts, and secret setup checklist.
- [docs/SETUP_STATUS.md](./docs/SETUP_STATUS.md): current setup progress and immediate next actions.

## Local Development

Requirements today:

- Node.js 24 LTS.
- pnpm 11 via Corepack.
- Docker Desktop, OrbStack, or Colima for local Postgres and Redis.

Use the project Node version:

```sh
nvm use 24
corepack enable
```

Install dependencies:

```sh
pnpm install
```

Run the dashboard:

```sh
pnpm dev
```

Run the API:

```sh
pnpm dev:api
```

Run the worker in dry-run mode:

```sh
pnpm dev:worker
```

Start local Postgres and Redis after Docker is installed:

```sh
docker compose up -d
```

Generate the database client after installing dependencies:

```sh
pnpm db:generate
```

Validate before pushing:

```sh
pnpm typecheck
pnpm build
```

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
