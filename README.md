# GET OUT SPAM

GET OUT SPAM is a GitHub App that helps small open-source maintainers review suspicious GitHub interactions before moving a conversation off GitHub or sharing sensitive access.

For a small open-source project, even one issue, comment, or star can feel meaningful. That makes maintainers more exposed to spam and social-engineering attempts: a friendly message, a request to move to another channel, or an unexpected offer can feel exciting enough to lower caution.

I experienced this while maintaining `pubm`. The attention around the project felt genuinely welcome, and I nearly moved the conversation to another channel. I cannot know whether that would have caused personal harm, but it made the risk clear enough to build a warning layer for other maintainers.

That is why GET OUT SPAM exists.

## What It Does

- Scores spam risk from public GitHub account history, comment content, and interaction context.
- Shows maintainers a review hint when an interaction has risk signals.
- Helps maintainers keep discussion on GitHub and avoid rushing into private access, personal contact, or off-platform communication.

## What It Does Not Do

- It does not declare that a user is a spammer, malicious, or acting with a specific intent.
- It does not detect or block agents, bots, or automated accounts.
- It does not collect or publish private information beyond publicly visible GitHub data.
- It does not automatically block, report, or penalize users on behalf of maintainers.

## Public Scope

Publishing the scoring algorithm directly would make it easier to bypass. The current implementation is operated through a GitHub App and a Cloudflare Worker, with operational source managed in a separate repository.

- Operational source repository: https://github.com/syi0808/get-out-spam-source
- GitHub App installation: https://github.com/apps/get-out-spam

This repository is not an open-source code repository. It is a public page for explaining GET OUT SPAM and collecting issues, missed cases, false positives, and product ideas.

## Reports And Suggestions

Please open an issue if you have:

- A GitHub issue, pull request, or comment that looks like spam but was not detected.
- A case that was flagged as risky but appears legitimate.
- An idea for better signals, wording, review flow, or maintainer controls.
- Feedback on how the public explanation can be clearer.

When reporting a case, include a public GitHub URL whenever possible. Do not post private repository content, personal contact information, tokens, secret keys, or full private conversations.
