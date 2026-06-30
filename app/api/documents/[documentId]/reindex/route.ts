import { NextResponse } from "next/server";
import type { DocumentReindexResponse, RagDocumentReindexResponse } from "@/lib/types";

export const runtime = "nodejs";

interface RouteContext {
  params: {
    documentId: string;
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

function isRagDocumentReindexResponse(value: unknown): value is RagDocumentReindexResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.document_id === "number" &&
    typeof value.title === "string" &&
    typeof value.source === "string" &&
    (value.status === "indexed" || value.status === "empty") &&
    typeof value.chunks_count === "number" &&
    typeof value.message === "string"
  );
}

function normalizeReindexResponse(payload: RagDocumentReindexResponse): DocumentReindexResponse {
  return {
    documentId: payload.document_id,
    title: payload.title,
    source: payload.source,
    status: payload.status,
    chunksCount: payload.chunks_count,
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
  if (isRecord(payload)) {
    if (typeof payload.detail === "string") {
      return payload.detail;
    }

    if (Array.isArray(payload.detail)) {
      return "El backend RAG rechazó el reindexado documental.";
    }
  }

  return "El backend RAG no pudo reindexar el documento.";
}

export async function POST(_request: Request, context: RouteContext) {
  const { apiUrl, apiKey } = getRagConfig();
  const documentId = Number(context.params.documentId);

  if (!Number.isInteger(documentId) || documentId <= 0) {
    return NextResponse.json({ error: "El documentId debe ser un número positivo." }, { status: 400 });
  }

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
    ragResponse = await fetch(`${apiUrl}/documents/${documentId}/reindex`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "No pudimos conectar con el backend RAG. Revisa que rag-lia esté levantado." },
      { status: 503 },
    );
  }

  const ragPayload = await readJsonSafely(ragResponse);

  if (!ragResponse.ok) {
    return NextResponse.json({ error: getUpstreamError(ragPayload) }, { status: 502 });
  }

  if (!isRagDocumentReindexResponse(ragPayload)) {
    return NextResponse.json(
      { error: "El backend RAG respondió con un reindexado documental inesperado." },
      { status: 502 },
    );
  }

  return NextResponse.json(normalizeReindexResponse(ragPayload));
}
