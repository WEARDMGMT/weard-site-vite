# Security review

## Architecture and access review

This repository is a public, static React marketing site plus one serverless contact endpoint. It has no user accounts, password handling, database connection, admin area, or privileged application routes. Password hashing, database authorization, and admin-route controls therefore do not apply. Do not add these capabilities to the browser bundle; if introduced later, implement server-side sessions, deny-by-default authorization on every endpoint, Argon2id password hashing, parameterized database queries, and least-privilege database credentials.

The contact endpoint accepts only same-origin POST requests, validates and allow-lists fields again on the server, limits request size, uses a bot trap, and applies a best-effort per-instance rate limit. Configure a durable rate-limit rule in Vercel Firewall for `/api/contact` because serverless instances do not share memory.

## Secrets and environment

EmailJS configuration is server-only. Copy `.env.example` locally or configure the variables in Vercel, never use a `VITE_` prefix, and rotate any value that was ever committed or exposed in a client bundle. The private EmailJS key is required by the endpoint. Environment files are ignored except `.env.example`.

Before each release, run a dedicated history-aware secret scanner such as `gitleaks git .`; the repository's tracked files and Git history were also reviewed with pattern searches during this audit. Enable provider-side secret scanning and rotate credentials rather than merely deleting leaked values.

## Deployment checklist

- Keep production debug/source-map output disabled (the Vite production configuration does not enable it).
- Keep the CSP and other headers in `vercel.json` and `public/_headers` aligned.
- Restrict production CORS to same origin; the endpoint deliberately sends no cross-origin allow header.
- Add Vercel Firewall rate limiting for `/api/contact` and monitor 429/5xx responses.
- Run `npm audit`, `npm outdated`, the production build, and secret scanning before deployment.
- Review third-party HubSpot and Apollo scripts periodically; they run only after consent but remain supply-chain dependencies.
