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

## Immediate Next Setup

1. Create private GitHub repo.
2. Push `main`.
3. Add your cofounder as a collaborator with appropriate access.
4. Create first GitHub Issues for the MVP build milestones.
5. Start scaffold work from a clean branch or a small direct commit.
