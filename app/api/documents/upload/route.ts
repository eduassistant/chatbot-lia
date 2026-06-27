import { NextResponse } from "next/server";
import type { DocumentUploadResponse, RagDocumentUploadResponse } from "@/lib/types";

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

function isRagDocumentUploadResponse(value: unknown): value is RagDocumentUploadResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.document_id === "number" &&
    typeof value.title === "string" &&
    typeof value.filename === "string" &&
    typeof value.extension === "string" &&
    typeof value.chunks_count === "number" &&
    value.status === "indexed" &&
    typeof value.message === "string"
  );
}

function normalizeUploadResponse(payload: RagDocumentUploadResponse): DocumentUploadResponse {
  return {
    documentId: payload.document_id,
    title: payload.title,
    filename: payload.filename,
    contentType: payload.content_type,
    extension: payload.extension,
    chunksCount: payload.chunks_count,
    status: payload.status,
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
      return "El backend RAG rechazó el formato del archivo.";
    }
  }

  return "El backend RAG no pudo cargar el documento.";
}

export async function POST(request: Request) {
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

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "El request debe enviarse como multipart/form-data." },
      { status: 400 },
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "El campo file es requerido." }, { status: 400 });
  }

  const upstreamFormData = new FormData();
  upstreamFormData.append("file", file, file.name);

  let ragResponse: Response;

  try {
    ragResponse = await fetch(`${apiUrl}/documents/upload`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
      body: upstreamFormData,
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

  if (!isRagDocumentUploadResponse(ragPayload)) {
    return NextResponse.json(
      { error: "El backend RAG respondió con un formato inesperado." },
      { status: 502 },
    );
  }

  return NextResponse.json(normalizeUploadResponse(ragPayload));
}
