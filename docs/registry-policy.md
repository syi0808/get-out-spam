# Evidence Registry Policy

Verified: 2026-05-02 KST

## Purpose
`get-out-spam-evidence` is a public moderation evidence index for maintainer due diligence.

It records public GitHub moderation events. It does not classify a GitHub user as spam, unsafe, dishonest, or acting with bad intent.

## Accepted Evidence
Registry entries may include only evidence that is:

- Publicly visible on GitHub.
- Linkable to a GitHub issue, pull request, or API resource.
- A moderation event rather than a subjective judgment.

Accepted v0.1 evidence types:

- `PUBLIC_USER_BLOCKED_EVENT`: a public issue or pull request timeline event showing `user_blocked`.
- `PUBLIC_SPAM_LOCK_EVENT`: a public issue or pull request timeline event showing a spam lock reason when the API exposes it.

## Rejected Evidence
Registry entries must not include:

- Private reports.
- Screenshots without a public GitHub URL or public API evidence.
- Repeated outreach similarity results.
- LLM judgments.
- Full copied comment bodies.
- Personal contact information.
- Private repository data.
- Claims about intent, identity, motive, or character.
- Labels such as `scammer`, `fraud`, `criminal`, `fake account`, or `malicious`.

## Data Minimization
Registry records should store the smallest useful factual record:

- GitHub username.
- Evidence type.
- Public GitHub source URL.
- API resource type.
- Repository and issue or PR number.
- Observed timestamp when available.
- Collection timestamp.

Registry records should not store full comment text unless a future accepted evidence type makes a short excerpt necessary. v0.1 does not need excerpts.

## Correction And Removal Requests
Anyone may request a correction or removal by opening an issue in `get-out-spam-evidence`.

The request should include:

- The affected registry file or evidence URL.
- The requested change.
- The reason for the request.
- A public source when available.

Accepted request types:

- The source URL no longer shows the recorded event.
- The event was recorded for the wrong username.
- The event type was mapped incorrectly.
- The source was private, deleted, or not reviewable.
- The registry file contains private information.
- The record uses non-neutral language.
- The username changed and the record needs an alias or update.

Review process:

- A registry maintainer checks the public source.
- If the request involves private information, remove the disputed data first and review after removal.
- If the record is wrong, fix it through PR.
- If the source is no longer public, remove or mark the observation as withdrawn.
- If the record is accurate and still public, close the request with a short factual explanation.

## PR Review Rules
Every evidence PR must be reviewed before merge.

Review checklist:

- The evidence source is public.
- The event type is one of the accepted evidence types.
- The username matches the event subject.
- The record uses neutral language.
- The record does not include full comment bodies.
- The record does not include private information.
- The PR body states that the registry is not a spam verdict system.

## Public Output Rules
Tools using this registry must:

- Present registry hits as public moderation evidence.
- Avoid person-level verdicts.
- Link to evidence where possible.
- Say that findings are maintainer review hints, not spam verdicts.

## Sources
- GitHub Timeline Events API: https://docs.github.com/en/rest/issues/timeline
- GitHub Issue Event Types: https://docs.github.com/en/rest/using-the-rest-api/issue-event-types
- GitHub Private Information Removal Policy: https://docs.github.com/en/site-policy/content-removal-policies/github-private-information-removal-policy
- GitHub Bullying and Harassment policy: https://docs.github.com/en/site-policy/acceptable-use-policies/github-bullying-and-harassment
- GitHub Community Guidelines: https://docs.github.com/en/site-policy/github-terms/github-community-guidelines
- GitHub Terms of Service: https://docs.github.com/en/site-policy/github-terms/github-terms-of-service
