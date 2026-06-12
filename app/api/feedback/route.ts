import { NextResponse } from "next/server";
import type { FeedbackRequest, FeedbackResponse, FeedbackValue, RagFeedbackResponse } from "@/lib/types";

export const runtime = "nodejs";

const allowedFeedbackValues = new Set<FeedbackValue>([
  "useful",
  "insufficient",
  "needs_human_support",
]);

function getRagConfig() {
  return {
    apiUrl: process.env.RAG_API_URL?.replace(/\/+$/, ""),
    apiKey: process.env.RAG_API_KEY,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getStringValue(payload: Record<string, unknown>, key: string) {
  const value = payload[key];

  return typeof value === "string" ? value.trim() : "";
}

function getFeedbackValue(payload: Record<string, unknown>): FeedbackValue | null {
  const feedback = getStringValue(payload, "feedback");

  return allowedFeedbackValues.has(feedback as FeedbackValue) ? (feedback as FeedbackValue) : null;
}

function normalizeRequestPayload(payload: unknown): FeedbackRequest | null {
  if (!isRecord(payload)) {
    return null;
  }

  const traceId = getStringValue(payload, "traceId");
  const feedback = getFeedbackValue(payload);

  if (!traceId || !feedback) {
    return null;
  }

  const comment = getStringValue(payload, "comment");
  const source = getStringValue(payload, "source");

  return {
    traceId,
    feedback,
    comment: comment || undefined,
    source: source || "chatbot-lia",
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
  if (isRecord(payload)) {
    if (typeof payload.detail === "string") {
      return payload.detail;
    }

    if (Array.isArray(payload.detail)) {
      return "El backend RAG rechazó el formato del feedback.";
    }
  }

  return "El backend RAG no pudo registrar el feedback.";
}

function normalizeRagFeedbackResponse(payload: unknown): FeedbackResponse | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (
    typeof payload.id !== "number" ||
    typeof payload.trace_id !== "string" ||
    typeof payload.feedback !== "string" ||
    typeof payload.message !== "string"
  ) {
    return null;
  }

  return {
    id: payload.id,
    traceId: payload.trace_id,
    feedback: payload.feedback as FeedbackValue,
    message: payload.message,
  };
}

export async function POST(request: Request) {
  let requestPayload: unknown;

  try {
    requestPayload = await request.json();
  } catch {
    return NextResponse.json({ error: "El request debe tener un body JSON válido." }, { status: 400 });
  }

  const feedbackPayload = normalizeRequestPayload(requestPayload);

  if (!feedbackPayload) {
    return NextResponse.json(
      { error: "El feedback debe incluir traceId y un valor válido." },
      { status: 400 },
    );
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
    const payload = {
      trace_id: feedbackPayload.traceId,
      feedback: feedbackPayload.feedback,
      comment: feedbackPayload.comment,
      source: feedbackPayload.source ?? "chatbot-lia",
    };

    ragResponse = await fetch(`${apiUrl}/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "No pudimos conectar con el backend RAG para registrar el feedback." },
      { status: 503 },
    );
  }

  const ragPayload: RagFeedbackResponse | unknown = await readJsonSafely(ragResponse);

  if (!ragResponse.ok) {
    return NextResponse.json({ error: getUpstreamError(ragPayload) }, { status: 502 });
  }

  const normalizedResponse = normalizeRagFeedbackResponse(ragPayload);

  if (!normalizedResponse) {
    return NextResponse.json(
      { error: "El backend RAG respondió con un formato de feedback inesperado." },
      { status: 502 },
    );
  }

  return NextResponse.json(normalizedResponse);
}
