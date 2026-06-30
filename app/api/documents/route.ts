import { NextResponse } from "next/server";
import type {
  DocumentLibraryItem,
  DocumentLibraryListResponse,
  RagDocumentLibraryItem,
  RagDocumentLibraryListResponse,
} from "@/lib/types";

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

function isRagDocumentItem(value: unknown): value is RagDocumentLibraryItem {
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
    typeof value.created_at === "string"
  );
}

function isRagDocumentListResponse(value: unknown): value is RagDocumentLibraryListResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.items) &&
    value.items.every(isRagDocumentItem) &&
    typeof value.total === "number" &&
    typeof value.limit === "number" &&
    typeof value.offset === "number"
  );
}

function normalizeDocumentItem(item: RagDocumentLibraryItem): DocumentLibraryItem {
  return {
    documentId: item.document_id,
    title: item.title,
    source: item.source,
    filename: item.filename,
    extension: item.extension,
    status: item.status,
    chunksCount: item.chunks_count,
    contentChars: item.content_chars,
    createdAt: item.created_at,
  };
}

function normalizeListResponse(payload: RagDocumentLibraryListResponse): DocumentLibraryListResponse {
  return {
    items: payload.items.map(normalizeDocumentItem),
    total: payload.total,
    limit: payload.limit,
    offset: payload.offset,
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
      return "El backend RAG rechazó los filtros documentales.";
    }
  }

  return "El backend RAG no pudo listar los documentos.";
}

export async function GET(request: Request) {
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

  const requestUrl = new URL(request.url);
  const upstreamUrl = new URL(`${apiUrl}/documents`);

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

  if (!isRagDocumentListResponse(ragPayload)) {
    return NextResponse.json(
      { error: "El backend RAG respondió con un formato documental inesperado." },
      { status: 502 },
    );
  }

  return NextResponse.json(normalizeListResponse(ragPayload));
}
