import type {
  AdminFeedbackItem,
  AdminPaginationResponse,
  RagAdminFeedbackItem,
  RagAdminListResponse,
} from "@/lib/types";
import {
  isOptionalString,
  isPaginatedPayload,
  isRecord,
  isRecordOrMissing,
  proxyAdminObservabilityRequest,
} from "../_shared/observabilityProxy";

export const runtime = "nodejs";

function isFeedbackItem(value: unknown): value is RagAdminFeedbackItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    isOptionalString(value.trace_id) &&
    typeof value.feedback === "string" &&
    isOptionalString(value.comment) &&
    isOptionalString(value.source) &&
    isOptionalString(value.user_identifier) &&
    isOptionalString(value.question) &&
    isOptionalString(value.response_preview) &&
    isRecordOrMissing(value.metadata) &&
    typeof value.created_at === "string"
  );
}

function normalizeFeedbackItem(item: RagAdminFeedbackItem): AdminFeedbackItem {
  return {
    id: item.id,
    traceId: item.trace_id ?? null,
    feedback: item.feedback,
    comment: item.comment ?? null,
    source: item.source ?? null,
    userIdentifier: item.user_identifier ?? null,
    question: item.question ?? null,
    responsePreview: item.response_preview ?? null,
    metadata: item.metadata ?? {},
    createdAt: item.created_at,
  };
}

function isFeedbackList(payload: unknown): payload is RagAdminListResponse<RagAdminFeedbackItem> {
  return isPaginatedPayload(payload, isFeedbackItem);
}

function normalizeFeedbackList(
  payload: RagAdminListResponse<RagAdminFeedbackItem>,
): AdminPaginationResponse<AdminFeedbackItem> {
  return {
    items: payload.items.map(normalizeFeedbackItem),
    total: payload.total,
    page: payload.page,
    pageSize: payload.page_size,
  };
}

export async function GET(request: Request) {
  return proxyAdminObservabilityRequest(request, {
    endpoint: "feedback",
    validate: isFeedbackList,
    normalize: normalizeFeedbackList,
    fallbackError: "El backend RAG no pudo listar el feedback administrativo.",
    unexpectedFormatError: "El backend RAG respondió con un formato de feedback inesperado.",
  });
}
