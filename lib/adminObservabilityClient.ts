import type {
  AdminCaseItem,
  AdminFeedbackItem,
  AdminObservabilityFilters,
  AdminPaginationResponse,
  AdminRagTraceItem,
} from "./types";

export class AdminObservabilityClientError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AdminObservabilityClientError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isOptionalString(value: unknown): value is string | null | undefined {
  return typeof value === "string" || value === null || value === undefined;
}

function isPlainRecordArray(value: unknown): value is Array<Record<string, unknown>> {
  return Array.isArray(value) && value.every(isRecord);
}

function isFeedbackItem(value: unknown): value is AdminFeedbackItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    isOptionalString(value.traceId) &&
    typeof value.feedback === "string" &&
    isOptionalString(value.comment) &&
    isOptionalString(value.source) &&
    isOptionalString(value.userIdentifier) &&
    isOptionalString(value.question) &&
    isOptionalString(value.responsePreview) &&
    isRecord(value.metadata) &&
    typeof value.createdAt === "string"
  );
}

function isTraceItem(value: unknown): value is AdminRagTraceItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.traceId === "string" &&
    typeof value.status === "string" &&
    isOptionalString(value.question) &&
    isOptionalString(value.responsePreview) &&
    isOptionalString(value.riskLevel) &&
    isOptionalString(value.recommendedAction) &&
    typeof value.escalationRequired === "boolean" &&
    typeof value.sourcesCount === "number" &&
    typeof value.retrievalCount === "number" &&
    typeof value.durationMs === "number" &&
    isOptionalString(value.llmProvider) &&
    isOptionalString(value.llmModel) &&
    isOptionalString(value.errorType) &&
    isOptionalString(value.errorMessage) &&
    isPlainRecordArray(value.retrievedChunks) &&
    isPlainRecordArray(value.sources) &&
    isRecord(value.safety) &&
    isRecord(value.metadata) &&
    typeof value.createdAt === "string"
  );
}

function isCaseItem(value: unknown): value is AdminCaseItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.caseId === "string" &&
    isOptionalString(value.traceId) &&
    (typeof value.feedbackId === "number" || value.feedbackId === null || value.feedbackId === undefined) &&
    typeof value.triggerSource === "string" &&
    typeof value.status === "string" &&
    isOptionalString(value.riskLevel) &&
    isOptionalString(value.recommendedAction) &&
    typeof value.reason === "string" &&
    isOptionalString(value.resolutionNote) &&
    isRecord(value.safety) &&
    isRecord(value.metadata) &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isPaginatedResponse<T>(
  value: unknown,
  itemGuard: (item: unknown) => item is T,
): value is AdminPaginationResponse<T> {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.items) &&
    value.items.every(itemGuard) &&
    typeof value.total === "number" &&
    typeof value.page === "number" &&
    typeof value.pageSize === "number"
  );
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (isRecord(payload) && typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  return fallback;
}

function buildQueryString(filters: AdminObservabilityFilters) {
  const params = new URLSearchParams();

  const values: Record<string, string | number | undefined> = {
    page: filters.page ?? 1,
    page_size: filters.pageSize ?? 10,
    query: filters.query?.trim() || undefined,
    created_from: filters.createdFrom || undefined,
    created_to: filters.createdTo || undefined,
    feedback: filters.feedback || undefined,
    source: filters.source || undefined,
    user: filters.user?.trim() || undefined,
    status: filters.status || undefined,
    risk_level: filters.riskLevel || undefined,
    trigger_source: filters.triggerSource || undefined,
    event_type: filters.eventType || undefined,
  };

  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  }

  return params.toString();
}

async function fetchAdminList<T>(
  path: string,
  filters: AdminObservabilityFilters,
  itemGuard: (item: unknown) => item is T,
  fallbackError: string,
  unexpectedFormatError: string,
): Promise<AdminPaginationResponse<T>> {
  let response: Response;

  try {
    response = await fetch(`/api/admin/${path}?${buildQueryString(filters)}`, {
      method: "GET",
      cache: "no-store",
    });
  } catch {
    throw new AdminObservabilityClientError("No pudimos conectar con el panel administrativo.");
  }

  const payload = await readJsonSafely(response);

  if (!response.ok) {
    throw new AdminObservabilityClientError(getErrorMessage(payload, fallbackError), response.status);
  }

  if (!isPaginatedResponse(payload, itemGuard)) {
    throw new AdminObservabilityClientError(unexpectedFormatError);
  }

  return payload;
}

export function listAdminFeedback(filters: AdminObservabilityFilters = {}) {
  return fetchAdminList(
    "feedback",
    filters,
    isFeedbackItem,
    "No pudimos listar el feedback administrativo.",
    "La respuesta de feedback administrativo tiene un formato inesperado.",
  );
}

export function listAdminRagTraces(filters: AdminObservabilityFilters = {}) {
  return fetchAdminList(
    "rag-traces",
    filters,
    isTraceItem,
    "No pudimos listar las trazas RAG.",
    "La respuesta de trazas RAG tiene un formato inesperado.",
  );
}

export function listAdminCases(filters: AdminObservabilityFilters = {}) {
  return fetchAdminList(
    "cases",
    filters,
    isCaseItem,
    "No pudimos listar los casos sensibles/escalados.",
    "La respuesta de casos administrativos tiene un formato inesperado.",
  );
}
