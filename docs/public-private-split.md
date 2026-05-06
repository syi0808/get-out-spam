# Public Repository And Private Source Split

Verified: 2026-05-06 KST

## Decision
Do not make the current Git history public as-is. Deleting source files from the latest commit is not enough because older commits, tags, Actions logs, workflow defaults, and generated bundles can still expose implementation and operational details.

Use this split instead:

- Keep the current monorepo, or a renamed clone of it, as the private source repository.
- Create a fresh public repository with clean history for the GitHub Pages site and public documentation.
- Deploy the scan API and GitHub App Worker from the private source repository.
- Connect the public Pages site to the private API endpoint through a public, sanitized HTTP contract.

## Public Repository Contents
The public repository should contain only files that are safe to serve through GitHub Pages and safe to inspect in source form:

- `apps/site/**` or a renamed `site/**` static Pages app.
- `.github/workflows/deploy-pages.yml`.
- A clean public root `package.json` containing only site build/test scripts.
- A clean public `pnpm-lock.yaml` generated from the public site package only.
- A clean public `pnpm-workspace.yaml` if the public repo keeps `apps/site/**`.
- A clean public `tsconfig.base.json` if the public site package extends it.
- A public-facing `README.md`.
- `docs/public-comment-policy.md`.
- `docs/registry-policy.md`.
- Public assets such as badges and screenshots that do not reveal private deployment details.
- Public metadata such as `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, issue templates, and support policy.
- Sanitized example configuration files that contain defaults only.

The public site should use "review level" language. It should not call the result a spam verdict, and it should not show numeric scores by default.

## Clean Public Package Files
If the public repository keeps the same `apps/site` layout, create fresh package files like these instead of copying the private monorepo package files.

Root `package.json`:

```json
{
  "name": "get-out-spam-public",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@10.32.0",
  "scripts": {
    "build": "pnpm --filter get-out-spam-site build",
    "test": "pnpm --filter get-out-spam-site test",
    "typecheck": "pnpm --filter get-out-spam-site typecheck"
  },
  "devDependencies": {
    "@types/node": "^20.12.12",
    "esbuild": "^0.28.0",
    "tsx": "^4.19.2",
    "typescript": "^5.8.3",
    "vitest": "^3.1.4"
  }
}
```

Root `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/site"
```

Root `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "skipLibCheck": true
  }
}
```

After copying `apps/site/**`, run `pnpm install --lockfile-only` in the clean public repository to generate a new public `pnpm-lock.yaml`.

## Private Repository Contents
Keep these private unless a separate open-source release decision is made:

- `packages/core/**`.
- `packages/github/**`.
- `packages/evidence-schema/**`.
- `apps/github-app-worker/**`.
- `apps/cli/**`.
- `apps/action/**`.
- `apps/**/dist/**` generated bundles, especially Action bundles.
- `.github/workflows/deploy-worker.yml`.
- `.github/workflows/app-delivery-diagnostics.yml`.
- `.github/workflows/app-webhook-smoke.yml`.
- Worker and GitHub App configuration such as `wrangler.toml`.
- Implementation plans under `docs/plans/**`.
- Operational docs with Cloudflare, GitHub App, registry writer, live fixture, or deployment details.

## API Boundary
The public Pages app should call the private API with only the pasted GitHub URL:

```http
POST /api/scan-link
Content-Type: application/json

{ "url": "https://github.com/owner/repo/issues/123#issuecomment-456" }
```

The API should return only sanitized public output:

```json
{
  "status": "scanned",
  "input": {
    "url": "https://github.com/owner/repo/issues/123#issuecomment-456",
    "owner": "owner",
    "repo": "repo",
    "issue": 123,
    "commentId": 456
  },
  "subject": {
    "username": "octocat"
  },
  "target": {
    "kind": "commenter",
    "repo": "owner/repo",
    "issue": 123,
    "commentId": 456
  },
  "level": "review",
  "recommendation": "Review before engaging.",
  "signals": [
    {
      "type": "LOW_PUBLIC_CONTRIBUTION_HISTORY",
      "label": "Limited public contribution history.",
      "severity": "low"
    }
  ]
}
```

The public API must not return raw comment bodies, numeric scores, registry proposal write results, GitHub token state, stack traces, or private operational details.

The public API must not use a GitHub token that can read private repositories. Use unauthenticated public GitHub API visibility for this route unless a future public-only credential strategy is separately reviewed.

## Migration Sequence
1. Choose the private source repository name.
2. Move or clone the current full monorepo to that private source repository, preserving history there.
3. Move repository secrets to the private source repository only.
4. Verify private CI, Worker deployment, GitHub App diagnostics, and registry integration from the private source repository.
5. Create a fresh public repository with a new root commit and no old implementation history.
6. Copy only the approved public files into the public repository.
7. Generate a new public lockfile from the clean public package set; do not copy the private monorepo lockfile.
8. Remove live fixture references, private worker URLs, personal test targets, and operational defaults from public docs and workflows.
9. Configure GitHub Pages in the public repository.
10. Configure the Pages build variable `GET_OUT_SPAM_API_BASE_URL` to the deployed public scan API origin.
11. Configure `PUBLIC_SCAN_ALLOWED_ORIGINS` on the Worker with the final Pages origin.
12. Configure Cloudflare WAF or rate limiting for `/api/scan-link` before public beta.
13. Confirm the public repository has no backend source, generated Action bundles, private workflows, secrets, old refs, or old tags.
14. Change only the clean public repository to public visibility.

## Repository Settings
For the public Pages repository:

- Enable GitHub Pages.
- Keep Actions limited to the Pages deployment workflow.
- Remove all repository secrets unless a future Pages-only secret is strictly needed.
- Enable secret scanning and push protection.
- Protect `main`.
- Add license, security, support, and contribution metadata before broad distribution.

For the private source repository:

- Keep Cloudflare and GitHub App deployment secrets private.
- Use environment protection for production Worker deploys.
- Keep the default workflow token read-only unless a workflow needs write access.
- Restrict allowed Actions where possible.
- Keep Worker deploy, delivery diagnostics, synthetic webhook smoke tests, and registry writer workflows private.

## Required Secrets And Variables
Private source repository secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `GET_OUT_SPAM_GITHUB_APP_ID`
- `GET_OUT_SPAM_GITHUB_APP_PRIVATE_KEY`
- `GET_OUT_SPAM_GITHUB_WEBHOOK_SECRET`
- `REGISTRY_GITHUB_APP_ID`, if registry writer deployment is enabled
- `REGISTRY_GITHUB_APP_PRIVATE_KEY`, if registry writer deployment is enabled
- `REGISTRY_INSTALLATION_ID`, if registry writer deployment is enabled

Private Worker environment variables for the public scan route:

- `PUBLIC_SCAN_ALLOWED_ORIGINS`, required for browser access from the final Pages origin.

Public Pages repository variable:

- `GET_OUT_SPAM_API_BASE_URL`, set to the deployed scan API origin.

## Safety Checks Before Publication
Run these checks against the public repository checkout before changing visibility:

```bash
rg -n "PRIVATE_KEY|WEBHOOK_SECRET|GITHUB_TOKEN|CLOUDFLARE_API_TOKEN|REGISTRY_INSTALLATION_ID" .
rg -n "EXDEV|syi0808/pubm|workers.dev|comment-id|delivery-id" .
find . -path "*/dist/*" -o -path "./packages/*" -o -path "./apps/github-app-worker/*" -o -path "./apps/action/*" -o -path "./apps/cli/*"
rg -n "packages/core|packages/github|apps/github-app-worker|apps/action|apps/cli" pnpm-lock.yaml package.json pnpm-workspace.yaml
git log --oneline --all
git tag --list
```

Expected result:

- Secret names may appear only in public setup documentation, never with values.
- No live private fixture targets or personal test URLs remain.
- No backend packages, Worker source, CLI source, Action source, or generated private bundles remain.
- Public package and lock files reference only the public site package and public build tooling.
- Git history begins at the clean public root commit.
- No old private tags or refs are present.

## Remaining Decisions
- The exact private source repository name.
- Whether the public Pages repository keeps the `get-out-spam` name.
- The production API origin for `GET_OUT_SPAM_API_BASE_URL`.
- The production CORS allowlist for `PUBLIC_SCAN_ALLOWED_ORIGINS`.
- Whether any package or Action will ever be open-sourced separately.
- The license split between public site/docs and private source.
