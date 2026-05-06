export type ScanSignal = {
  name?: string;
  label?: string;
  severity?: string;
  summary?: string;
  reason?: string;
  value?: unknown;
};

export type ScanSubject = {
  login?: string;
  id?: string | number;
  type?: string;
  url?: string;
};

export type ScanTarget = {
  kind?: string;
  type?: string;
  owner?: string;
  repo?: string;
  number?: number;
  commentId?: number;
  url?: string;
};

export type ScanResult = {
  level: string;
  subject: string | ScanSubject;
  target: string | ScanTarget;
  recommendation: string;
  signals: ScanSignal[];
};

export class ScanLinkApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, status: number, message?: string) {
    super(message ?? code);
    this.name = "ScanLinkApiError";
    this.code = code;
    this.status = status;
  }
}

export async function scanLink(
  apiBaseUrl: string,
  url: string,
  fetchImpl: typeof fetch = fetch
): Promise<ScanResult> {
  const endpoint = `${apiBaseUrl.replace(/\/+$/, "")}/api/scan-link`;
  const response = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({ url })
  });

  const body = await readJson(response);

  if (!response.ok) {
    const errorCode = readErrorCode(body);
    throw new ScanLinkApiError(errorCode, response.status, userFacingError(errorCode));
  }

  return normalizeScanResult(body);
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

function readErrorCode(body: unknown): string {
  if (isRecord(body) && typeof body.error === "string") {
    return body.error;
  }

  return "api_error";
}

function userFacingError(code: string): string {
  switch (code) {
    case "invalid_json":
    case "invalid_request":
      return "The scan request was not accepted. Check the URL and try again.";
    case "unsupported_link":
      return "Use a GitHub issue, pull request, or issue-comment URL.";
    default:
      return "The scan API returned an error. Try again later.";
  }
}

function normalizeScanResult(body: unknown): ScanResult {
  const candidate = isRecord(body) && isRecord(body.result) ? body.result : body;

  if (!isRecord(candidate)) {
    throw new ScanLinkApiError("invalid_response", 200, "The scan API returned an unreadable response.");
  }

  return {
    level: stringField(candidate.level, "unknown"),
    subject: field(candidate.subject, "Unknown subject"),
    target: field(candidate.target, "Unknown target"),
    recommendation: stringField(candidate.recommendation, "Review this activity before taking action."),
    signals: signalList(candidate.signals)
  };
}

function signalList(value: unknown): ScanSignal[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isRecord).map((signal) => {
    const normalized: ScanSignal = {};
    assignString(normalized, "name", signal.name);
    assignString(normalized, "label", signal.label);
    assignString(normalized, "severity", signal.severity);
    assignString(normalized, "summary", signal.summary);
    assignString(normalized, "reason", signal.reason);

    if ("value" in signal) {
      normalized.value = signal.value;
    }

    return normalized;
  });
}

function field(value: unknown, fallback: string): string | ScanSubject | ScanTarget {
  if (typeof value === "string") {
    return value;
  }

  if (isRecord(value)) {
    return value;
  }

  return fallback;
}

function stringField(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

type ScanSignalStringKey = "name" | "label" | "severity" | "summary" | "reason";

function assignString(target: ScanSignal, key: ScanSignalStringKey, value: unknown): void {
  if (typeof value === "string") {
    target[key] = value;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
