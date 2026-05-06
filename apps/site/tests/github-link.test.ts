import { describe, expect, it } from "vitest";

import { parseGitHubLink } from "../src/github-link";

describe("parseGitHubLink", () => {
  it("accepts GitHub issue URLs", () => {
    expect(parseGitHubLink("https://github.com/syi0808/get-out-spam/issues/12")).toEqual({
      ok: true,
      link: {
        kind: "issue",
        owner: "syi0808",
        repo: "get-out-spam",
        number: 12,
        url: "https://github.com/syi0808/get-out-spam/issues/12"
      }
    });
  });

  it("accepts GitHub pull request URLs", () => {
    expect(parseGitHubLink("https://github.com/syi0808/get-out-spam/pull/34")).toEqual({
      ok: true,
      link: {
        kind: "pull",
        owner: "syi0808",
        repo: "get-out-spam",
        number: 34,
        url: "https://github.com/syi0808/get-out-spam/pull/34"
      }
    });
  });

  it("accepts www.github.com URLs", () => {
    expect(parseGitHubLink("https://www.github.com/syi0808/get-out-spam/issues/12")).toMatchObject({
      ok: true,
      link: {
        kind: "issue",
        owner: "syi0808",
        repo: "get-out-spam",
        number: 12
      }
    });
  });

  it("accepts GitHub issue-comment URLs on issues", () => {
    expect(parseGitHubLink("https://github.com/syi0808/get-out-spam/issues/12#issuecomment-99")).toEqual({
      ok: true,
      link: {
        kind: "issue_comment",
        owner: "syi0808",
        repo: "get-out-spam",
        parentKind: "issue",
        number: 12,
        commentId: 99,
        url: "https://github.com/syi0808/get-out-spam/issues/12#issuecomment-99"
      }
    });
  });

  it("accepts GitHub issue-comment URLs on pulls", () => {
    expect(parseGitHubLink("https://github.com/syi0808/get-out-spam/pull/34#issuecomment-101")).toEqual({
      ok: true,
      link: {
        kind: "issue_comment",
        owner: "syi0808",
        repo: "get-out-spam",
        parentKind: "pull",
        number: 34,
        commentId: 101,
        url: "https://github.com/syi0808/get-out-spam/pull/34#issuecomment-101"
      }
    });
  });

  it.each([
    "not a url",
    "http://github.com/syi0808/get-out-spam/issues/12",
    "https://example.com/syi0808/get-out-spam/issues/12",
    "https://github.com/syi0808/get-out-spam/discussions/12",
    "https://github.com/syi0808/get-out-spam/issues/0",
    "https://github.com/syi0808/get-out-spam/issues/12#issue-99",
    "https://github.com/syi0808/get-out-spam/issues/12/comments/99"
  ])("rejects unsupported URL %s", (url) => {
    expect(parseGitHubLink(url)).toEqual({ ok: false, error: "unsupported_link" });
  });
});
