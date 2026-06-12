import { NextResponse } from "next/server";
import type { ChatRequest, ChatResponse, RagChatResponse, RagSource, Source } from "@/lib/types";

export const runtime = "nodejs";

function getRagConfig() {
  return {
    apiUrl: process.env.RAG_API_URL?.replace(/\/+$/, ""),
    apiKey: process.env.RAG_API_KEY,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getRequestMessage(payload: unknown): string | null {
  if (!isRecord(payload) || typeof payload.message !== "string") {
    return null;
  }

  const message = payload.message.trim();

  return message || null;
}

function getSourceTitle(source: RagSource) {
  return source.title || source.document_title || `Documento #${source.document_id}`;
}

function getSourceFragment(source: RagSource) {
  return source.fragment || source.content || `Fragmento #${source.chunk_id}`;
}

function getSourceScore(source: RagSource) {
  if (typeof source.score === "number") {
    return source.score;
  }

  return source.distance;
}

function normalizeSource(source: RagSource): Source {
  return {
    documentId: source.document_id,
    chunkId: source.chunk_id,
    chunkIndex: source.chunk_index,
    title: getSourceTitle(source),
    fragment: getSourceFragment(source),
    score: getSourceScore(source),
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

function normalizeRagResponse(payload: unknown): ChatResponse | null {
  if (!isRecord(payload) || typeof payload.response !== "string") {
    return null;
  }

  const rawSources = Array.isArray(payload.sources) ? payload.sources : [];
  const sources = rawSources.filter(isRagSource).map(normalizeSource);

  return {
    response: payload.response,
    sources,
    traceId: typeof payload.trace_id === "string" ? payload.trace_id : undefined,
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
      return "El backend RAG rechazó el formato de la consulta.";
    }
  }

  return "El backend RAG no pudo procesar la consulta.";
}

export async function POST(request: Request) {
  let requestPayload: unknown;

  try {
    requestPayload = await request.json();
  } catch {
    return NextResponse.json({ error: "El request debe tener un body JSON válido." }, { status: 400 });
  }

  const message = getRequestMessage(requestPayload);

  if (!message) {
    return NextResponse.json({ error: "El mensaje no puede estar vacío." }, { status: 400 });
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
    const payload: ChatRequest = { message };

    ragResponse = await fetch(`${apiUrl}/chat`, {
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
      { error: "No pudimos conectar con el backend RAG. Revisa que rag-lia esté levantado." },
      { status: 503 },
    );
  }

  const ragPayload: RagChatResponse | unknown = await readJsonSafely(ragResponse);

  if (!ragResponse.ok) {
    return NextResponse.json({ error: getUpstreamError(ragPayload) }, { status: 502 });
  }

  const normalizedResponse = normalizeRagResponse(ragPayload);

  if (!normalizedResponse) {
    return NextResponse.json(
      { error: "El backend RAG respondió con un formato inesperado." },
      { status: 502 },
    );
  }

  return NextResponse.json(normalizedResponse);
}
