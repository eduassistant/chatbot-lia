import type {
  AdminPaginationResponse,
  AdminRagTraceItem,
  RagAdminListResponse,
  RagAdminTraceItem,
} from "@/lib/types";
import {
  isOptionalString,
  isPaginatedPayload,
  isPlainRecordArray,
  isRecord,
  isRecordOrMissing,
  proxyAdminObservabilityRequest,
} from "../_shared/observabilityProxy";

export const runtime = "nodejs";

function isTraceItem(value: unknown): value is RagAdminTraceItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.trace_id === "string" &&
    typeof value.status === "string" &&
    isOptionalString(value.question) &&
    isOptionalString(value.response_preview) &&
    isOptionalString(value.risk_level) &&
    isOptionalString(value.recommended_action) &&
    typeof value.escalation_required === "boolean" &&
    typeof value.sources_count === "number" &&
    typeof value.retrieval_count === "number" &&
    typeof value.duration_ms === "number" &&
    isOptionalString(value.llm_provider) &&
    isOptionalString(value.llm_model) &&
    isOptionalString(value.error_type) &&
    isOptionalString(value.error_message) &&
    (value.retrieved_chunks === undefined || isPlainRecordArray(value.retrieved_chunks)) &&
    (value.sources === undefined || isPlainRecordArray(value.sources)) &&
    isRecordOrMissing(value.safety) &&
    isRecordOrMissing(value.metadata) &&
    typeof value.created_at === "string"
  );
}

function normalizeTraceItem(item: RagAdminTraceItem): AdminRagTraceItem {
  return {
    id: item.id,
    traceId: item.trace_id,
    status: item.status,
    question: item.question ?? null,
    responsePreview: item.response_preview ?? null,
    riskLevel: item.risk_level ?? null,
    recommendedAction: item.recommended_action ?? null,
    escalationRequired: item.escalation_required,
    sourcesCount: item.sources_count,
    retrievalCount: item.retrieval_count,
    durationMs: item.duration_ms,
    llmProvider: item.llm_provider ?? null,
    llmModel: item.llm_model ?? null,
    errorType: item.error_type ?? null,
    errorMessage: item.error_message ?? null,
    retrievedChunks: item.retrieved_chunks ?? [],
    sources: item.sources ?? [],
    safety: item.safety ?? {},
    metadata: item.metadata ?? {},
    createdAt: item.created_at,
  };
}

function isTraceList(payload: unknown): payload is RagAdminListResponse<RagAdminTraceItem> {
  return isPaginatedPayload(payload, isTraceItem);
}

function normalizeTraceList(
  payload: RagAdminListResponse<RagAdminTraceItem>,
): AdminPaginationResponse<AdminRagTraceItem> {
  return {
    items: payload.items.map(normalizeTraceItem),
    total: payload.total,
    page: payload.page,
    pageSize: payload.page_size,
  };
}

export async function GET(request: Request) {
  return proxyAdminObservabilityRequest(request, {
    endpoint: "rag-traces",
    validate: isTraceList,
    normalize: normalizeTraceList,
    fallbackError: "El backend RAG no pudo listar las trazas administrativas.",
    unexpectedFormatError: "El backend RAG respondió con un formato de trazas inesperado.",
  });
}
