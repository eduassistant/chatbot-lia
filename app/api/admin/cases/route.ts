import type {
  AdminCaseItem,
  AdminPaginationResponse,
  RagAdminCaseItem,
  RagAdminListResponse,
} from "@/lib/types";
import {
  isOptionalNumber,
  isOptionalString,
  isPaginatedPayload,
  isRecord,
  isRecordOrMissing,
  proxyAdminObservabilityRequest,
} from "../_shared/observabilityProxy";

export const runtime = "nodejs";

function isCaseItem(value: unknown): value is RagAdminCaseItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.case_id === "string" &&
    isOptionalString(value.trace_id) &&
    isOptionalNumber(value.feedback_id) &&
    typeof value.trigger_source === "string" &&
    typeof value.status === "string" &&
    isOptionalString(value.risk_level) &&
    isOptionalString(value.recommended_action) &&
    typeof value.reason === "string" &&
    isOptionalString(value.resolution_note) &&
    isRecordOrMissing(value.safety) &&
    isRecordOrMissing(value.metadata) &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  );
}

function normalizeCaseItem(item: RagAdminCaseItem): AdminCaseItem {
  return {
    id: item.id,
    caseId: item.case_id,
    traceId: item.trace_id ?? null,
    feedbackId: item.feedback_id ?? null,
    triggerSource: item.trigger_source,
    status: item.status,
    riskLevel: item.risk_level ?? null,
    recommendedAction: item.recommended_action ?? null,
    reason: item.reason,
    resolutionNote: item.resolution_note ?? null,
    safety: item.safety ?? {},
    metadata: item.metadata ?? {},
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function isCaseList(payload: unknown): payload is RagAdminListResponse<RagAdminCaseItem> {
  return isPaginatedPayload(payload, isCaseItem);
}

function normalizeCaseList(
  payload: RagAdminListResponse<RagAdminCaseItem>,
): AdminPaginationResponse<AdminCaseItem> {
  return {
    items: payload.items.map(normalizeCaseItem),
    total: payload.total,
    page: payload.page,
    pageSize: payload.page_size,
  };
}

export async function GET(request: Request) {
  return proxyAdminObservabilityRequest(request, {
    endpoint: "cases",
    validate: isCaseList,
    normalize: normalizeCaseList,
    fallbackError: "El backend RAG no pudo listar los casos administrativos.",
    unexpectedFormatError: "El backend RAG respondió con un formato de casos inesperado.",
  });
}
