# Service Setup

Date: 2026-05-23

This file tracks setup that must exist for Truffl to move from local simulation to real pilot traffic.

Do not commit real keys, tokens, private phone numbers, customer data, or billing details. Put local development secrets in `.env`, production secrets in AWS Secrets Manager, and CI secrets in GitHub Actions secrets.

## Local Tooling

Required:

- Node.js 24 LTS through `nvm`.
- pnpm 11 through Corepack.
- Docker Desktop, OrbStack, or Colima for local Postgres and Redis.
- GitHub SSH access for pushing to the repository.

Official setup links:

- Docker Desktop: https://www.docker.com/products/docker-desktop/
- Node.js: https://nodejs.org/
- pnpm: https://pnpm.io/installation

Validation:

```sh
node -v
pnpm -v
docker version
pnpm db:generate
pnpm typecheck
pnpm build
```

## GitHub

Repository:

- Owner: `aatithyapersonal`
- Repo: `Truffl`
- Remote: `git@github.com:aatithyapersonal/Truffl.git`

Access:

- Cofounder email: `ayushi0186373@gmail.com`
- Resolved GitHub account: `Girlrox`
- Target access: highest available collaborator/admin access, or equal owner access through a GitHub organization.

Important:

- Personal repositories do not make collaborators equal owners of the GitHub account.
- For true same-level founder control, create a GitHub organization and transfer the repo there with both founders as organization owners.
- Keep the repo private before adding real credentials, customer data, or commercially sensitive implementation details.

## Plivo

Purpose:

- India-first outbound telephony.
- Call status callbacks.
- Recording and transcript callback coordination where supported.
- Later: transfer or bridge for human handoff.

Needed:

- Plivo account.
- Auth ID.
- Auth token.
- Purchased or approved outbound caller ID/number.
- Webhook callback URL for local tunnel, staging, and production.

Official setup link:

- https://www.plivo.com/

Environment variables:

```sh
VOICE_PROVIDER=mock
PLIVO_AUTH_ID=
PLIVO_AUTH_TOKEN=
PLIVO_FROM_NUMBER=
VOICE_PROVIDER_WEBHOOK_SECRET=
```

Current decision:

- Use `VOICE_PROVIDER=mock` until Plivo/Twilio credits and work-account approvals are ready.
- Keep Plivo as the India-first live adapter target.
- Keep Twilio as the broader/global live adapter target.

## Twilio

Purpose:

- Broader/global telephony path.
- Fallback provider for non-India markets.

Needed:

- Twilio account.
- Account SID.
- Auth token.
- Purchased or approved phone number/caller ID.
- Media/call status webhook configuration.

Official setup link:

- https://www.twilio.com/

Environment variables:

```sh
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
```

## OpenAI

Purpose:

- Realtime voice intelligence.
- LLM reasoning for journey setup and outcome extraction.
- Transcription/TTS fallback if not using realtime speech-to-speech for a given call path.

Needed:

- OpenAI platform account.
- API key.
- Project-level budget limits.
- Model and retention policy reviewed before production calls.

Official setup link:

- https://platform.openai.com/api-keys

Environment variables:

```sh
OPENAI_API_KEY=
```

## Shopify

Purpose:

- First store connector and app install surface.
- Development store for pilot-like testing without a real merchant store.

Needed:

- Shopify Partner account.
- Development store.
- Shopify app.
- App URL and redirect URLs for local tunnel, staging, and production.
- Admin API scopes for abandoned checkout, order, customer, product, and webhook flows as legally and operationally required.
- Webhook signing secret.
- Offline access token flow.

Created:

- Partner organization: `Truffl`
- Shopify app: `Truffl`
- App id: `372132184065`
- Client ID: `2ef973a6e982bafc7710adf1499ac2d1`
- Development store: `truffl-nvanxepp.myshopify.com`
- Development store id: `75539775667`
- Settings URL: `https://dev.shopify.com/dashboard/219768047/apps/372132184065/settings`

Do not commit the generated client secret. Keep it in local `.env` during development and a managed secret store for production.

Local status as of May 26, 2026:

- Client ID, client secret, webhook secret, and development store domain are present in local `.env`.
- The secret values are intentionally not documented or committed.
- Next: configure app URL, redirect URLs, scopes, install flow, and webhook ingestion.

Official setup link:

- https://partners.shopify.com/

Environment variables:

```sh
SHOPIFY_API_KEY=
SHOPIFY_API_SECRET=
SHOPIFY_APP_URL=
SHOPIFY_WEBHOOK_SECRET=
SHOPIFY_ADMIN_ACCESS_TOKEN=
SHOPIFY_STORE_DOMAIN=
```

## AWS

Purpose:

- Production runtime and managed infrastructure.

Baseline:

- ECS Fargate for API, worker, and voice runtime containers.
- RDS PostgreSQL.
- ElastiCache Redis.
- S3 for recordings, transcripts, exports, and large payloads.
- Secrets Manager for provider credentials.
- CloudWatch and OpenTelemetry-compatible app telemetry.
- KMS encryption and least-privilege IAM.

Needed:

- AWS account.
- Billing configured.
- IAM admin user or IAM Identity Center access for initial setup.
- Region decision. India-first default candidate: `ap-south-1`.
- Budget alerts before real usage.

Official setup link:

- https://aws.amazon.com/

Environment variables for local development only:

```sh
AWS_REGION=ap-south-1
S3_RECORDINGS_BUCKET=
S3_TRANSCRIPTS_BUCKET=
```

## Meta WhatsApp Cloud API

Purpose:

- WhatsApp cart links and post-call follow-up.
- Support both Truffl-managed and merchant-owned WhatsApp modes.

Needed:

- Meta developer account.
- Business portfolio.
- WhatsApp Business Account.
- Cloud API app.
- Phone number ID.
- Permanent or system-user token for server use.
- Webhook verification token and callback URL.
- Message templates for production marketing or utility messages where required.

Official setup link:

- https://developers.facebook.com/docs/whatsapp/cloud-api/get-started

Environment variables:

```sh
WHATSAPP_PROVIDER=meta_cloud_api
META_WHATSAPP_ACCESS_TOKEN=
META_WHATSAPP_PHONE_NUMBER_ID=
META_WHATSAPP_BUSINESS_ACCOUNT_ID=
META_WHATSAPP_WEBHOOK_VERIFY_TOKEN=
WHATSAPP_WEBHOOK_SECRET=
```

## Setup Order

1. Finish local tooling: Node 24, pnpm, Docker.
2. Confirm GitHub access and repository privacy.
3. Create Shopify Partner account and development store.
4. Create OpenAI API key with budget controls.
5. Create Plivo account and obtain an India calling number or approved caller ID.
6. Create AWS account and budget alerts.
7. Create Meta developer setup for WhatsApp Cloud API.
8. Add only non-secret variable names to `.env.example`.
9. Add actual secrets to local `.env` and production secret manager only.
