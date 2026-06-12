import type { FeedbackRequest, FeedbackResponse } from "./types";

export class FeedbackClientError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "FeedbackClientError";
    this.status = status;
  }
}

function isFeedbackResponse(value: unknown): value is FeedbackResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Partial<FeedbackResponse>;

  return (
    typeof response.id === "number" &&
    typeof response.traceId === "string" &&
    typeof response.feedback === "string" &&
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

export async function sendFeedback(request: FeedbackRequest): Promise<FeedbackResponse> {
  const traceId = request.traceId.trim();

  if (!traceId) {
    throw new FeedbackClientError("No se encontró la traza de la respuesta para registrar feedback.");
  }

  let response: Response;

  try {
    response = await fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        traceId,
        feedback: request.feedback,
        comment: request.comment,
        source: request.source ?? "chatbot-lia",
      }),
    });
  } catch {
    throw new FeedbackClientError("No pudimos registrar el feedback. Intenta nuevamente.");
  }

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new FeedbackClientError(
      getErrorMessage(payload, "El backend no pudo registrar el feedback."),
      response.status,
    );
  }

  if (!isFeedbackResponse(payload)) {
    throw new FeedbackClientError("El endpoint de feedback respondió con un formato inesperado.");
  }

  return payload;
}
