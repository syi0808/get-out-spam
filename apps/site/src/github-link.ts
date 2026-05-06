export type GitHubLinkKind = "issue" | "pull" | "issue_comment";

export type GitHubLink =
  | {
      kind: "issue";
      owner: string;
      repo: string;
      number: number;
      url: string;
    }
  | {
      kind: "pull";
      owner: string;
      repo: string;
      number: number;
      url: string;
    }
  | {
      kind: "issue_comment";
      owner: string;
      repo: string;
      parentKind: "issue" | "pull";
      number: number;
      commentId: number;
      url: string;
    };

export type GitHubLinkParseResult =
  | { ok: true; link: GitHubLink }
  | { ok: false; error: "unsupported_link" };

const integerPattern = /^[1-9]\d*$/;
const issueCommentPattern = /^issuecomment-([1-9]\d*)$/;

export function parseGitHubLink(input: string): GitHubLinkParseResult {
  let parsed: URL;

  try {
    parsed = new URL(input.trim());
  } catch {
    return { ok: false, error: "unsupported_link" };
  }

  if (parsed.protocol !== "https:" || !["github.com", "www.github.com"].includes(parsed.hostname.toLowerCase())) {
    return { ok: false, error: "unsupported_link" };
  }

  const segments = parsed.pathname.split("/").filter(Boolean);
  if (segments.length !== 4) {
    return { ok: false, error: "unsupported_link" };
  }

  const [owner, repo, subjectType, subjectNumber] = segments;
  if (!owner || !repo || !subjectNumber || !integerPattern.test(subjectNumber)) {
    return { ok: false, error: "unsupported_link" };
  }

  if (subjectType !== "issues" && subjectType !== "pull") {
    return { ok: false, error: "unsupported_link" };
  }

  const number = Number.parseInt(subjectNumber, 10);
  const parentKind = subjectType === "issues" ? "issue" : "pull";
  const canonicalUrl = parsed.toString();

  if (parsed.hash) {
    const commentMatch = issueCommentPattern.exec(parsed.hash.slice(1));
    if (!commentMatch?.[1]) {
      return { ok: false, error: "unsupported_link" };
    }

    return {
      ok: true,
      link: {
        kind: "issue_comment",
        owner,
        repo,
        parentKind,
        number,
        commentId: Number.parseInt(commentMatch[1], 10),
        url: canonicalUrl
      }
    };
  }

  return {
    ok: true,
    link: {
      kind: parentKind,
      owner,
      repo,
      number,
      url: canonicalUrl
    }
  };
}
