import "./styles.css";

import { scanLink, type ScanResult, type ScanSignal } from "./api";
import { parseGitHubLink } from "./github-link";

declare const __GET_OUT_SPAM_API_BASE_URL__: string;

declare global {
  interface Window {
    GET_OUT_SPAM_API_BASE_URL?: string;
  }
}

const form = requiredElement<HTMLFormElement>("scan-form");
const input = requiredElement<HTMLInputElement>("link-input");
const button = requiredElement<HTMLButtonElement>("scan-button");
const endpointNotice = requiredElement<HTMLElement>("endpoint-notice");
const statusRegion = requiredElement<HTMLElement>("status-region");
const resultRegion = requiredElement<HTMLElement>("result-region");

const apiConfig = resolveApiBaseUrl();
endpointNotice.hidden = apiConfig.configured;

form.addEventListener("submit", (event) => {
  event.preventDefault();
  void submitScan();
});

input.addEventListener("input", () => {
  if (statusRegion.dataset.state === "validation-error") {
    setIdle();
  }
});

async function submitScan(): Promise<void> {
  const url = input.value.trim();
  const parsed = parseGitHubLink(url);

  if (!parsed.ok) {
    renderValidationError();
    return;
  }

  renderLoading();

  try {
    const result = await scanLink(apiConfig.baseUrl, url);
    renderResult(result);
  } catch (error) {
    renderApiError(error);
  }
}

function resolveApiBaseUrl(): { baseUrl: string; configured: boolean } {
  const runtimeValue = window.GET_OUT_SPAM_API_BASE_URL?.trim();
  if (runtimeValue) {
    return { baseUrl: runtimeValue, configured: true };
  }

  const buildValue = __GET_OUT_SPAM_API_BASE_URL__.trim();
  if (buildValue) {
    return { baseUrl: buildValue, configured: true };
  }

  return { baseUrl: window.location.origin, configured: false };
}

function renderLoading(): void {
  button.disabled = true;
  input.setAttribute("aria-invalid", "false");
  resultRegion.hidden = true;
  resultRegion.replaceChildren();
  statusRegion.dataset.state = "loading";
  statusRegion.className = "status-region is-loading";
  statusRegion.textContent = "Scanning link...";
}

function renderValidationError(): void {
  button.disabled = false;
  input.setAttribute("aria-invalid", "true");
  resultRegion.hidden = true;
  resultRegion.replaceChildren();
  statusRegion.dataset.state = "validation-error";
  statusRegion.className = "status-region is-error";
  statusRegion.textContent = "Use a GitHub issue, pull request, or issue-comment URL.";
}

function renderApiError(error: unknown): void {
  button.disabled = false;
  input.setAttribute("aria-invalid", "false");
  resultRegion.hidden = true;
  resultRegion.replaceChildren();
  statusRegion.dataset.state = "api-error";
  statusRegion.className = "status-region is-error";
  statusRegion.textContent = error instanceof Error ? error.message : "The scan API returned an error.";
}

function renderResult(result: ScanResult): void {
  button.disabled = false;
  input.setAttribute("aria-invalid", "false");
  statusRegion.dataset.state = "result";
  statusRegion.className = "status-region";
  statusRegion.textContent = "Scan complete.";

  const header = element("div", "result-header");
  const level = element("span", `level-badge level-${slug(result.level)}`, result.level);
  const verdictNote = element("p", "result-note", "Maintainer review hint, not a spam verdict.");
  header.append(level, verdictNote);

  const details = element("dl", "result-details", [
    ...detail("Subject", formatUnknown(result.subject)),
    ...detail("Target", formatUnknown(result.target)),
    ...detail("Recommendation", result.recommendation)
  ]);

  const signals = renderSignals(result.signals);
  resultRegion.replaceChildren(header, details, signals);
  resultRegion.hidden = false;
}

function renderSignals(signals: ScanSignal[]): HTMLElement {
  const section = element("section", "signals-section");
  const title = element("h2", undefined, "Signals");
  section.append(title);

  if (signals.length === 0) {
    section.append(element("p", "empty-signals", "No signals returned."));
    return section;
  }

  const list = element("div", "signal-list");
  for (const signal of signals) {
    list.append(renderSignal(signal));
  }

  section.append(list);
  return section;
}

function renderSignal(signal: ScanSignal): HTMLElement {
  const name = signal.label ?? signal.name ?? "Signal";
  const metaParts = [signal.severity].filter(Boolean);
  const summary = signal.summary ?? signal.reason ?? (signal.value === undefined ? undefined : formatUnknown(signal.value));
  const mainChildren = [element("h3", undefined, name)];
  if (summary) {
    mainChildren.push(element("p", undefined, summary));
  }

  return element("article", "signal-row", [
    element("div", "signal-main", mainChildren),
    element("div", "signal-meta", metaParts.join(" / "))
  ]);
}

function detail(label: string, value: string): HTMLElement[] {
  return [element("dt", undefined, label), element("dd", undefined, value)];
}

function setIdle(): void {
  input.setAttribute("aria-invalid", "false");
  statusRegion.dataset.state = "idle";
  statusRegion.className = "status-region";
  statusRegion.textContent = "";
}

function requiredElement<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) {
    throw new Error(`Missing required element: ${id}`);
  }

  return found as T;
}

function element(tagName: string, className?: string, content?: string | Node | Node[]): HTMLElement {
  const node = document.createElement(tagName);
  if (className) {
    node.className = className;
  }

  if (typeof content === "string") {
    node.textContent = content;
  } else if (Array.isArray(content)) {
    node.append(...content);
  } else if (content) {
    node.append(content);
  }

  return node;
}

function formatUnknown(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map(formatUnknown).join(", ");
  }

  if (isRecord(value)) {
    return Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined && entryValue !== null && entryValue !== "")
      .map(([key, entryValue]) => `${humanize(key)}: ${formatUnknown(entryValue)}`)
      .join(", ");
  }

  return "Unknown";
}

function humanize(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/_/g, " ").toLowerCase();
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
