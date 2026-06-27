import type { DocumentUploadResponse } from "./types";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = [".pdf", ".txt", ".md", ".docx"];

export class DocumentUploadClientError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "DocumentUploadClientError";
    this.status = status;
  }
}

function getFileExtension(filename: string) {
  const dotIndex = filename.lastIndexOf(".");

  if (dotIndex === -1) {
    return "";
  }

  return filename.slice(dotIndex).toLowerCase();
}

function isDocumentUploadResponse(value: unknown): value is DocumentUploadResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Partial<DocumentUploadResponse>;

  return (
    typeof response.documentId === "number" &&
    typeof response.title === "string" &&
    typeof response.filename === "string" &&
    typeof response.extension === "string" &&
    typeof response.chunksCount === "number" &&
    response.status === "indexed" &&
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

export function validateDocumentFile(file: File) {
  const extension = getFileExtension(file.name);

  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    throw new DocumentUploadClientError(
      "Formato no soportado. Podés cargar PDF, TXT, Markdown (.md) o Word (.docx).",
    );
  }

  if (file.size === 0) {
    throw new DocumentUploadClientError("El archivo está vacío.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new DocumentUploadClientError("El archivo supera el tamaño máximo permitido de 10 MB.");
  }
}

export async function uploadDocument(file: File): Promise<DocumentUploadResponse> {
  validateDocumentFile(file);

  const formData = new FormData();
  formData.append("file", file);

  let response: Response;

  try {
    response = await fetch("/api/documents/upload", {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new DocumentUploadClientError(
      "No pudimos conectar con el backend para cargar el documento.",
    );
  }

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new DocumentUploadClientError(
      getErrorMessage(payload, "El backend no pudo cargar el documento."),
      response.status,
    );
  }

  if (!isDocumentUploadResponse(payload)) {
    throw new DocumentUploadClientError("El endpoint de carga respondió con un formato inesperado.");
  }

  return payload;
}
