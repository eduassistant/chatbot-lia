import type {
  DocumentLibraryDetail,
  DocumentLibraryFilters,
  DocumentLibraryItem,
  DocumentLibraryListResponse,
  DocumentReindexResponse,
} from "./types";

export class DocumentLibraryClientError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "DocumentLibraryClientError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isDocumentItem(value: unknown): value is DocumentLibraryItem {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.documentId === "number" &&
    typeof value.title === "string" &&
    typeof value.source === "string" &&
    (typeof value.filename === "string" || value.filename === null || value.filename === undefined) &&
    (typeof value.extension === "string" || value.extension === null || value.extension === undefined) &&
    (value.status === "indexed" || value.status === "empty") &&
    typeof value.chunksCount === "number" &&
    typeof value.contentChars === "number" &&
    typeof value.createdAt === "string"
  );
}

function isDocumentListResponse(value: unknown): value is DocumentLibraryListResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.items) &&
    value.items.every(isDocumentItem) &&
    typeof value.total === "number" &&
    typeof value.limit === "number" &&
    typeof value.offset === "number"
  );
}

function isDocumentDetail(value: unknown): value is DocumentLibraryDetail {
  if (!isDocumentItem(value) || !isRecord(value)) {
    return false;
  }

  return (
    typeof value.contentPreview === "string" &&
    Array.isArray(value.chunks) &&
    value.chunks.every(
      (chunk) =>
        isRecord(chunk) &&
        typeof chunk.chunkId === "number" &&
        typeof chunk.chunkIndex === "number" &&
        typeof chunk.contentPreview === "string" &&
        typeof chunk.createdAt === "string",
    )
  );
}

function isReindexResponse(value: unknown): value is DocumentReindexResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.documentId === "number" &&
    typeof value.title === "string" &&
    typeof value.source === "string" &&
    (value.status === "indexed" || value.status === "empty") &&
    typeof value.chunksCount === "number" &&
    typeof value.message === "string"
  );
}

function getErrorMessage(payload: unknown, fallback: string) {
  if (isRecord(payload) && typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  return fallback;
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function buildQueryString(filters: DocumentLibraryFilters) {
  const params = new URLSearchParams();

  if (filters.query?.trim()) {
    params.set("query", filters.query.trim());
  }

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.extension) {
    params.set("extension", filters.extension);
  }

  params.set("limit", String(filters.limit ?? 20));
  params.set("offset", String(filters.offset ?? 0));

  return params.toString();
}

export async function listDocuments(
  filters: DocumentLibraryFilters = {},
): Promise<DocumentLibraryListResponse> {
  let response: Response;

  try {
    response = await fetch(`/api/documents?${buildQueryString(filters)}`, {
      method: "GET",
      cache: "no-store",
    });
  } catch {
    throw new DocumentLibraryClientError("No pudimos conectar con la biblioteca documental.");
  }

  const payload = await readJsonSafely(response);

  if (!response.ok) {
    throw new DocumentLibraryClientError(
      getErrorMessage(payload, "No pudimos listar los documentos del RAG."),
      response.status,
    );
  }

  if (!isDocumentListResponse(payload)) {
    throw new DocumentLibraryClientError("La biblioteca documental respondió con un formato inesperado.");
  }

  return payload;
}

export async function getDocumentDetail(documentId: number): Promise<DocumentLibraryDetail> {
  let response: Response;

  try {
    response = await fetch(`/api/documents/${documentId}`, {
      method: "GET",
      cache: "no-store",
    });
  } catch {
    throw new DocumentLibraryClientError("No pudimos conectar con el detalle documental.");
  }

  const payload = await readJsonSafely(response);

  if (!response.ok) {
    throw new DocumentLibraryClientError(
      getErrorMessage(payload, "No pudimos obtener el detalle del documento."),
      response.status,
    );
  }

  if (!isDocumentDetail(payload)) {
    throw new DocumentLibraryClientError("El detalle documental respondió con un formato inesperado.");
  }

  return payload;
}

export async function reindexDocument(documentId: number): Promise<DocumentReindexResponse> {
  let response: Response;

  try {
    response = await fetch(`/api/documents/${documentId}/reindex`, {
      method: "POST",
      cache: "no-store",
    });
  } catch {
    throw new DocumentLibraryClientError("No pudimos conectar con el reindexado documental.");
  }

  const payload = await readJsonSafely(response);

  if (!response.ok) {
    throw new DocumentLibraryClientError(
      getErrorMessage(payload, "No pudimos reindexar el documento."),
      response.status,
    );
  }

  if (!isReindexResponse(payload)) {
    throw new DocumentLibraryClientError("El reindexado respondió con un formato inesperado.");
  }

  return payload;
}
