# Operating Practices

## Why This Exists

Voice OS will mix product judgment, customer experience, integrations, data, voice quality, and compliance. Version control protects code, but the project also needs lightweight habits that protect decisions.

## Source of Truth

Use this repo as the source of truth for:

- Product architecture.
- Build-level architecture.
- Technical decisions.
- MVP scope.
- Project working agreements.
- Later: code, tests, dashboards, and deployment notes.

Avoid scattering key decisions across chats without capturing them here.

## Recommended Practices

### 1. Git From Day One

Every meaningful change should be committed.

Use small commits. A good commit should explain one logical unit of progress.

### 2. GitHub Private Repo

Use a private GitHub repo as soon as possible.

GitHub gives:

- Backup.
- Collaboration.
- Issues.
- Pull requests.
- Project history.
- A shared place for your cofounder to review product-level changes.

For truly equal founder access, prefer a GitHub organization with both founders as organization owners. A personal repository can grant collaborator access, but it does not make another person equal owner of the account itself.

### 3. Issues for Work Tracking

Use GitHub Issues for build tasks and product questions.

Recommended labels:

- `product`
- `engineering`
- `architecture`
- `pilot`
- `compliance`
- `decision`
- `blocked`

### 4. Decision Log

When we make a meaningful decision, write it down.

Examples:

- Voice provider choice.
- WhatsApp provider choice.
- Whether to use Shopify abandoned checkouts vs webhook-derived abandonment.
- Calling window rules.
- Attribution windows.
- Offer and discount policy.
- Approved product claims policy.

Use [DECISIONS.md](./DECISIONS.md).

### 5. Cofounder Review Loop

Your cofounder should not need to read code.

Give her review surfaces like:

- Journey flow screenshots.
- Dashboard screenshots.
- Architecture summaries.
- Customer-facing scripts.
- Risk/compliance notes.
- Pilot-readiness checklists.

Her role is product, business, customer, and risk signal.

### 6. Weekly Founder Checkpoint

Once per week, review:

- What shipped?
- What changed in scope?
- What decisions were made?
- What is blocked?
- What are the top three risks?
- What must be true for the next pilot step?

Capture outcomes in the repo if they affect the build.

### 7. Secrets Discipline

Use `.env.example` for names of required variables, never real values.

Real secrets should live in:

- Local `.env` for development.
- GitHub Actions secrets for CI.
- Deployment provider secrets for production.

Never paste production secrets into docs, issues, commit messages, pull requests, screenshots, or chat transcripts unless the channel is explicitly designed for secret handling.

### 8. Customer Data Discipline

Do not store real customer data in the repo.

Use fixtures with fake names, phones, emails, checkouts, and orders.

### 9. Architecture Before Expansion

Do not build all five abandoned-cart journeys at once.

First prove:

- High-AOV New Buyer.
- End-to-end journey state.
- Attribution.
- Dashboard usefulness.
- Safe voice/WhatsApp behavior.

Then add journey variants.

### 10. Definition of Done

A feature is not done until:

- It is committed.
- It has a clear product behavior.
- It is tested or manually verified.
- It does not leak secrets or real customer data.
- It has a dashboard or log trail if it affects operations.

### 11. Tooling Discipline

Production primitives should be installed and configured, not bypassed.

Baseline local tools:

- Node.js 24 LTS through `nvm`.
- pnpm 11 through Corepack.
- Docker Desktop, OrbStack, or Colima for local Postgres and Redis.
- Git and GitHub remote connected over SSH.

Before pushing meaningful code changes:

- Install dependencies with `pnpm install`.
- Generate database client code with `pnpm db:generate` when Prisma changes or dependencies are refreshed.
- Run `pnpm typecheck`.
- Run `pnpm build`.
- Commit lockfile changes with dependency changes.

Dry-run modes are allowed for early slices, but they must preserve the same architecture as the real service path.

## Immediate Next Setup

1. Confirm the GitHub repository is private before real secrets, customer data, or sensitive business details are added.
2. Have the cofounder accept the GitHub collaborator invitation.
3. Upgrade access to the highest appropriate role, or move the repo into a founder-owned GitHub organization.
4. Install Docker Desktop, OrbStack, or Colima.
5. Create service accounts and development credentials from `docs/SERVICE_SETUP.md`.
6. Create first GitHub Issues for the MVP build milestones.
