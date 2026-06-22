import { NextResponse } from "next/server";
import type {
  ConversationHistoryResponse,
  ConversationMessage,
  RagConversationMessage,
  RagConversationResponse,
  RagSource,
  Source,
} from "@/lib/types";

export const runtime = "nodejs";

interface RouteContext {
  params: {
    conversationId: string;
  };
}

function getRagConfig() {
  return {
    apiUrl: process.env.RAG_API_URL?.replace(/\/+$/, ""),
    apiKey: process.env.RAG_API_KEY,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeSource(source: RagSource): Source {
  return {
    documentId: source.document_id,
    chunkId: source.chunk_id,
    chunkIndex: source.chunk_index,
    title: source.title || source.document_title || `Documento #${source.document_id}`,
    fragment: source.fragment || source.content || `Fragmento #${source.chunk_id}`,
    score:
      typeof source.score === "number"
        ? source.score
        : typeof source.relevance_score === "number"
          ? source.relevance_score
          : source.distance,
  };
}

function isRagSource(value: unknown): value is RagSource {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.document_id === "number" &&
    typeof value.chunk_id === "number" &&
    typeof value.chunk_index === "number" &&
    typeof value.distance === "number"
  );
}

function isRagConversationMessage(value: unknown): value is RagConversationMessage {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    (value.role === "user" || value.role === "assistant") &&
    typeof value.content === "string" &&
    typeof value.created_at === "string"
  );
}

function normalizeMessage(message: RagConversationMessage): ConversationMessage {
  const rawSources = Array.isArray(message.sources) ? message.sources : [];

  return {
    id: message.id,
    role: message.role,
    content: message.content,
    traceId: typeof message.trace_id === "string" ? message.trace_id : undefined,
    caseId: typeof message.case_id === "string" ? message.case_id : undefined,
    sources: rawSources.filter(isRagSource).map(normalizeSource),
    createdAt: message.created_at,
  };
}

function normalizeConversation(payload: unknown): ConversationHistoryResponse | null {
  if (
    !isRecord(payload) ||
    typeof payload.conversation_id !== "string" ||
    (payload.status !== "active" && payload.status !== "expired") ||
    typeof payload.message_count !== "number" ||
    !Array.isArray(payload.messages) ||
    typeof payload.message !== "string"
  ) {
    return null;
  }

  return {
    conversationId: payload.conversation_id,
    status: payload.status,
    messageCount: payload.message_count,
    messages: payload.messages.filter(isRagConversationMessage).map(normalizeMessage),
    expiresAt: typeof payload.expires_at === "string" ? payload.expires_at : undefined,
    message: payload.message,
  };
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getUpstreamError(payload: unknown) {
  if (isRecord(payload) && typeof payload.detail === "string") {
    return payload.detail;
  }

  return "No pudimos recuperar el historial conversacional.";
}

export async function GET(_request: Request, context: RouteContext) {
  const conversationId = context.params.conversationId?.trim();

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId es requerido." }, { status: 400 });
  }

  const { apiUrl, apiKey } = getRagConfig();

  if (!apiUrl || !apiKey) {
    return NextResponse.json(
      {
        error:
          "El frontend no tiene configuradas las variables privadas RAG_API_URL y RAG_API_KEY.",
      },
      { status: 500 },
    );
  }

  let ragResponse: Response;

  try {
    ragResponse = await fetch(`${apiUrl}/conversations/${conversationId}`, {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "No pudimos conectar con el backend RAG para recuperar el historial." },
      { status: 503 },
    );
  }

  const ragPayload: RagConversationResponse | unknown = await readJsonSafely(ragResponse);

  if (!ragResponse.ok) {
    return NextResponse.json({ error: getUpstreamError(ragPayload) }, { status: ragResponse.status });
  }

  const normalizedConversation = normalizeConversation(ragPayload);

  if (!normalizedConversation) {
    return NextResponse.json(
      { error: "El backend RAG respondió con un formato inesperado de historial." },
      { status: 502 },
    );
  }

  return NextResponse.json(normalizedConversation);
}
