# Setup Status

Date: 2026-05-25

This tracks where the setup order stands right now.

## Current Status

| Area | Status | Notes |
| --- | --- | --- |
| Node.js | Done | Node `v24.16.0` verified locally. |
| pnpm | Done | pnpm `11.2.2` verified locally through Corepack. |
| GitHub | Mostly done | Repo is connected and pushed. Cofounder invite was sent to `Girlrox`; access still depends on invite acceptance. Repo visibility should be confirmed before secrets/customer data. |
| Docker | Done | Docker CLI `29.4.3` and Compose `v5.1.4` are installed. Docker Desktop is running and Compose services started successfully. |
| Local Postgres/Redis | Done | `truffl-postgres` and `truffl-redis` were started with Docker Compose and reported healthy. Initial Prisma migration has been committed and pushed. |
| Plivo | Deferred | Live India telephony needs credits/work-account approval. Use simulated voice until then. |
| Twilio | Deferred | Live global telephony needs credits/work-account approval. Use simulated voice until then. |
| OpenAI | Key available, rotate recommended | A key was pasted in chat, so rotate it before serious use and store only in local `.env` or a secret manager. |
| Shopify | Partner app and dev store created | Shopify Partner app `Truffl` was created in the Dev Dashboard. App id: `372132184065`. Development store: `truffl-nvanxepp.myshopify.com`. Still need client secret stored locally, app URL/redirect URLs, scopes, and eventually an offline access token. |
| AWS | Account created | Need CLI/profile setup, budget alert, region confirmation, and later S3/RDS/Redis/ECS resources. |
| Meta WhatsApp | Account setup in progress | Need app, WABA, phone number ID, business account ID, token, webhook verify token, and app secret/webhook secret. |

## Immediate Next Actions

1. Store the Shopify client secret only in local `.env` or a secret manager.
2. Decide the local tunnel/staging URL, then configure Shopify app URL and redirect URLs.
3. Set the initial Shopify scopes needed for the abandoned-cart pilot.
4. Install Truffl on the development store and generate the offline access token.
5. Rotate the OpenAI key that was pasted in chat, then place the new key only in local `.env`.
6. Configure AWS CLI access with either IAM Identity Center or a named profile.
7. Pull Meta WhatsApp IDs/tokens from the Meta App Dashboard after the WhatsApp product is configured.

## Shopify Values Needed

| Variable | Where it comes from |
| --- | --- |
| `SHOPIFY_API_KEY` | Shopify Dev Dashboard app settings: Client ID. Current app Client ID: `2ef973a6e982bafc7710adf1499ac2d1`. |
| `SHOPIFY_API_SECRET` | Shopify Dev Dashboard app settings: Client secret. Do not commit this. |
| `SHOPIFY_APP_URL` | Our public app URL. Local development will need a tunnel URL later. |
| `SHOPIFY_WEBHOOK_SECRET` | Same practical secret source as the app client secret for verifying Shopify webhooks. |
| `SHOPIFY_ADMIN_ACCESS_TOKEN` | Generated through app install/OAuth for the development store. |
| `SHOPIFY_STORE_DOMAIN` | Development store domain. Current dev store: `truffl-nvanxepp.myshopify.com`. |

## Shopify App Created

| Field | Value |
| --- | --- |
| Partner organization | `Truffl` |
| App name | `Truffl` |
| App id | `372132184065` |
| Client ID | `2ef973a6e982bafc7710adf1499ac2d1` |
| Development store | `truffl-nvanxepp.myshopify.com` |
| Development store id | `75539775667` |
| Created at | May 25, 2026, 6:55 pm IST |
| Current dashboard URL | `https://dev.shopify.com/dashboard/219768047/apps/372132184065/settings` |

The generated client secret is intentionally not documented here. Store it only in local `.env`, a deployment secret store, or a password manager.

## AWS Values Needed

For now, Truffl should not need long-lived AWS keys in `.env` unless we are running AWS SDK calls locally.

Preferred local setup:

- Configure AWS CLI with IAM Identity Center or a named profile.
- Use `AWS_REGION=ap-south-1` for the India-first baseline unless we decide otherwise.
- Later add S3 bucket names after infrastructure exists.

Potential variables:

| Variable | Where it comes from |
| --- | --- |
| `AWS_REGION` | AWS region decision. Current default: `ap-south-1`. |
| `S3_RECORDINGS_BUCKET` | Created S3 bucket for call recordings. |
| `S3_TRANSCRIPTS_BUCKET` | Created S3 bucket for transcripts. |

Avoid root-account access keys. Use short-lived role credentials or a least-privilege IAM user only when a local tool truly needs it.

## Meta WhatsApp Values Needed

| Variable | Where it comes from |
| --- | --- |
| `META_WHATSAPP_ACCESS_TOKEN` | Meta app / Business Manager system-user or temporary test token. |
| `META_WHATSAPP_PHONE_NUMBER_ID` | WhatsApp > API Setup or phone number management. |
| `META_WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp Business Account details/API setup. |
| `META_WHATSAPP_WEBHOOK_VERIFY_TOKEN` | A token we choose and enter both in Meta and Truffl. |
| `WHATSAPP_WEBHOOK_SECRET` | App secret or webhook signing secret used to verify callbacks. |

Use test WhatsApp resources first. Production templates and real phone numbers can come later.
