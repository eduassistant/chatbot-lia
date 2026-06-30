import { NextResponse } from "next/server";
import type {
  DocumentChunkPreview,
  DocumentLibraryDetail,
  RagDocumentChunkPreview,
  RagDocumentLibraryDetail,
} from "@/lib/types";

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

function isRagChunkPreview(value: unknown): value is RagDocumentChunkPreview {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.chunk_id === "number" &&
    typeof value.chunk_index === "number" &&
    typeof value.content_preview === "string" &&
    typeof value.created_at === "string"
  );
}

function isRagDocumentDetail(value: unknown): value is RagDocumentLibraryDetail {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.document_id === "number" &&
    typeof value.title === "string" &&
    typeof value.source === "string" &&
    (typeof value.filename === "string" || value.filename === null || value.filename === undefined) &&
    (typeof value.extension === "string" || value.extension === null || value.extension === undefined) &&
    (value.status === "indexed" || value.status === "empty") &&
    typeof value.chunks_count === "number" &&
    typeof value.content_chars === "number" &&
    typeof value.created_at === "string" &&
    typeof value.content_preview === "string" &&
    Array.isArray(value.chunks) &&
    value.chunks.every(isRagChunkPreview)
  );
}

function normalizeChunk(chunk: RagDocumentChunkPreview): DocumentChunkPreview {
  return {
    chunkId: chunk.chunk_id,
    chunkIndex: chunk.chunk_index,
    contentPreview: chunk.content_preview,
    createdAt: chunk.created_at,
  };
}

function normalizeDetail(payload: RagDocumentLibraryDetail): DocumentLibraryDetail {
  return {
    documentId: payload.document_id,
    title: payload.title,
    source: payload.source,
    filename: payload.filename,
    extension: payload.extension,
    status: payload.status,
    chunksCount: payload.chunks_count,
    contentChars: payload.content_chars,
    createdAt: payload.created_at,
    contentPreview: payload.content_preview,
    chunks: payload.chunks.map(normalizeChunk),
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
      return "El backend RAG rechazó el identificador documental.";
    }
  }

  return "El backend RAG no pudo obtener el detalle documental.";
}

export async function GET(request: Request, context: RouteContext) {
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

  const requestUrl = new URL(request.url);
  const upstreamUrl = new URL(`${apiUrl}/documents/${documentId}`);

  for (const [key, value] of requestUrl.searchParams.entries()) {
    upstreamUrl.searchParams.set(key, value);
  }

  let ragResponse: Response;

  try {
    ragResponse = await fetch(upstreamUrl.toString(), {
      method: "GET",
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

  if (!isRagDocumentDetail(ragPayload)) {
    return NextResponse.json(
      { error: "El backend RAG respondió con un detalle documental inesperado." },
      { status: 502 },
    );
  }

  return NextResponse.json(normalizeDetail(ragPayload));
}
