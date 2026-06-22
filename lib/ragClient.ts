import type { ChatRequest, ChatResponse, ConversationHistoryResponse } from "./types";

export class RagClientError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "RagClientError";
    this.status = status;
  }
}

function isChatResponse(value: unknown): value is ChatResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Partial<ChatResponse>;

  return (
    typeof response.response === "string" &&
    Array.isArray(response.sources) &&
    (response.conversationId === undefined || typeof response.conversationId === "string") &&
    (response.traceId === undefined || typeof response.traceId === "string")
  );
}

function isConversationHistoryResponse(value: unknown): value is ConversationHistoryResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Partial<ConversationHistoryResponse>;

  return (
    typeof response.conversationId === "string" &&
    (response.status === "active" || response.status === "expired") &&
    typeof response.messageCount === "number" &&
    Array.isArray(response.messages) &&
    typeof response.message === "string"
  );
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: unknown }).error;
    if (typeof error === "string" && error.trim()) {
      return error;
    }
  }

  return fallback;
}

export async function sendMessage(
  message: string,
  conversationId?: string,
): Promise<ChatResponse> {
  const trimmedMessage = message.trim();

  if (!trimmedMessage) {
    throw new RagClientError("El mensaje no puede estar vacío.");
  }

  const requestPayload: ChatRequest = {
    message: trimmedMessage,
    conversationId,
  };

  let response: Response;

  try {
    response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestPayload),
    });
  } catch {
    throw new RagClientError("No pudimos conectar con el RAG. Revisa el backend o intenta nuevamente.");
  }

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new RagClientError(
      getErrorMessage(payload, "El RAG no pudo procesar la consulta. Intenta nuevamente."),
      response.status,
    );
  }

  if (!isChatResponse(payload)) {
    throw new RagClientError("El RAG respondió con un formato inesperado.");
  }

  return payload;
}

export async function fetchConversationHistory(
  conversationId: string,
): Promise<ConversationHistoryResponse | null> {
  const trimmedConversationId = conversationId.trim();

  if (!trimmedConversationId) {
    throw new RagClientError("conversationId es requerido para recuperar historial.");
  }

  let response: Response;

  try {
    response = await fetch(`/api/conversations/${trimmedConversationId}`, {
      method: "GET",
      cache: "no-store",
    });
  } catch {
    throw new RagClientError("No pudimos recuperar el historial conversacional.");
  }

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new RagClientError(
      getErrorMessage(payload, "No pudimos recuperar el historial conversacional."),
      response.status,
    );
  }

  if (!isConversationHistoryResponse(payload)) {
    throw new RagClientError("El historial respondió con un formato inesperado.");
  }

  return payload;
}
