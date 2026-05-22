# Contributing

This project is currently in early MVP mode. Keep the workflow lightweight, but disciplined enough that product, technical, and founder decisions do not get lost.

## Commit Style

Use small commits with clear messages:

```txt
chore: initialize project docs
docs: add working agreement
feat: add high-aov journey simulator
fix: prevent duplicate cart evaluation
test: cover high-aov decision rules
```

Prefer these prefixes:

- `docs:` for architecture, planning, and process notes.
- `chore:` for setup and maintenance.
- `feat:` for new product behavior.
- `fix:` for bugs.
- `test:` for tests.
- `refactor:` for internal cleanup that should not change behavior.

## Branches

Use `main` as the stable branch.

For product/build work, use short-lived branches:

```txt
feat/high-aov-simulator
feat/shopify-ingestion
docs/architecture-update
fix/cart-dedupe
```

For now, direct commits to `main` are acceptable for documentation and early scaffolding. Once the first runnable app exists, use pull requests for anything meaningful.

## Pull Requests

Every pull request should answer:

- What changed?
- Why did it change?
- How was it tested or reviewed?
- Does this affect product behavior, customer data, integrations, or compliance?

## Cofounder Review

Your cofounder does not need to review implementation details line by line.

She should review:

- Product flows.
- Customer-facing language.
- Risk/compliance decisions.
- Pilot readiness.
- Dashboards and business metrics.
- Major architecture or vendor tradeoffs.

## Do Not Commit

Never commit:

- `.env` files.
- API keys.
- Shopify tokens.
- WhatsApp provider credentials.
- Voice provider credentials.
- Customer data from real brands.
- Call recordings or transcripts from real users.

Use sample data until explicit approval exists for live pilot data.
