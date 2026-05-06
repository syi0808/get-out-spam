# Get Out Spam

Get Out Spam is public maintainer tooling for checking GitHub interactions before moving a conversation off GitHub or sharing private access.

The GitHub Pages app accepts a GitHub issue, pull request, or issue-comment link and sends that URL to a server-side scan API. The page shows a coarse review level and neutral signal labels. It is not a spam verdict system and does not show numeric scores by default.

## Local Development

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
```

## Deployment

GitHub Pages is deployed by `.github/workflows/deploy-pages.yml`. Configure the repository variable `GET_OUT_SPAM_API_BASE_URL` with the deployed scan API origin before running the workflow.

The scan API is deployed from the private source repository. Configure `PUBLIC_SCAN_ALLOWED_ORIGINS` on the Worker with this Pages origin and protect `/api/scan-link` with Cloudflare rate limiting or WAF rules before public beta.

## Public/Private Split

The implementation source, Worker deployment, GitHub App internals, CLI, Action bundle, and operational workflows live in a private source repository. This public repository should contain only the static site, public policy docs, approved assets, and the Pages workflow.

See [docs/public-private-split.md](docs/public-private-split.md).
