# Public Comment Policy

Verified: 2026-05-02 KST

## Decision
Get Out Spam may post public bot comments by default for `suspicious` and `high` results. The comment may show the coarse review level, but it must be score-free by default, verdict-free, and framed as a maintainer review hint.

This risk is reduced but not eliminated. Public beta should still get external legal or experienced maintainer review before broad distribution.

## Allowed Comment Shape
The comment should describe the interaction, not the person's intent.

Recommended v0.1 body:

```md
<!-- get-out-spam:v1 subject={username} target={targetKind} resource={owner}/{repo}#{number} -->
### GET OUT SPAM review for @{username}

Review level: {riskLevel} (4 levels: low -> review -> suspicious -> high)

Target:
- User: @{username}
- Event: {event}
- Resource: {resource permalink}

Recommendation:
Keep discussion on GitHub and ask for a concrete technical proposal before sharing private access or moving off-platform.

Signals:
- {neutral signal label with evidence link}

This is not a spam verdict. It is a maintainer review hint based on public signals.
```

## Required Controls
- Post public comments only at `suspicious` or `high`.
- Show coarse review level by default with `comment.showRiskLevel: true`.
- Do not include numeric score in public comments by default. Numeric score may be enabled explicitly with `comment.showScore: true`.
- Do not say the user is unsafe, fake, fraudulent, dishonest, or acting with bad intent.
- Do not include private data.
- Do not include copied comment bodies.
- Keep evidence labels factual and neutral.
- For additional commenters, identify the scanned interaction by permalink instead of labeling the whole issue.
- Keep labels off for additional commenters by default.
- Allow maintainers to disable public comments with `mode.publicComment: false`.

## Allowed Signal Labels
Use neutral labels such as:

- Prior public moderation event.
- Limited public contribution history.
- Similar public outreach pattern.
- Off-platform contact request.
- Broad short-window repository distribution.

Avoid labels such as:

- Scammer.
- Fraud.
- Malicious.
- Fake account.
- Criminal.
- Bad actor.

## Review Gate
Before public beta:

- Ask at least one experienced open-source maintainer to review the default comment.
- Ask legal counsel or a qualified policy reviewer if the project will run as a hosted public service.
- Test the comment against a false-positive scenario involving a legitimate new contributor.
- Test the comment against an additional-commenter scenario where the issue author is unrelated.

The app can ship private testing without this external review if the installation scope is controlled.

## Sources
- GitHub Bullying and Harassment policy: https://docs.github.com/en/site-policy/acceptable-use-policies/github-bullying-and-harassment
- GitHub Community Guidelines: https://docs.github.com/en/site-policy/github-terms/github-community-guidelines
- GitHub Terms of Service: https://docs.github.com/en/site-policy/github-terms/github-terms-of-service
