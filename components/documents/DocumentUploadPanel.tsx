"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { uploadDocument } from "@/lib/documentUploadClient";
import type { DocumentUploadResponse, DocumentUploadStatus } from "@/lib/types";

function getStatusLabel(status: DocumentUploadStatus) {
  if (status === "uploading") {
    return "Cargando y procesando documento...";
  }

  if (status === "success") {
    return "Documento indexado correctamente.";
  }

  if (status === "error") {
    return "No se pudo cargar el documento.";
  }

  return "Esperando archivo.";
}

export function DocumentUploadPanel() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<DocumentUploadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastUpload, setLastUpload] = useState<DocumentUploadResponse | null>(null);

  async function handleFile(file: File | null | undefined) {
    if (!file || status === "uploading") {
      return;
    }

    setStatus("uploading");
    setError(null);
    setLastUpload(null);

    try {
      const result = await uploadDocument(file);
      setLastUpload(result);
      setStatus("success");
    } catch (unknownError) {
      const errorMessage =
        unknownError instanceof Error
          ? unknownError.message
          : "No pudimos cargar el documento al RAG.";

      setError(errorMessage);
      setStatus("error");
    } finally {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    void handleFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    void handleFile(event.dataTransfer.files?.[0]);
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
  }

  return (
    <aside className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-primary" aria-hidden="true">
          ⬆
        </span>
        <h2 className="text-lg font-semibold text-foreground">Carga documental</h2>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Subí documentos para alimentar el RAG. Formatos admitidos: PDF, TXT, Markdown y Word/DOCX.
      </p>

      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-4 py-6 text-center text-sm transition hover:bg-secondary"
      >
        <span className="mb-2 text-2xl" aria-hidden="true">
          📄
        </span>
        <span className="font-semibold text-foreground">Arrastrá un archivo o seleccioná uno</span>
        <span className="mt-1 text-xs text-muted-foreground">Máximo 10 MB</span>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.txt,.md,.docx"
          disabled={status === "uploading"}
          onChange={handleInputChange}
          className="sr-only"
          aria-label="Seleccionar documento para cargar al RAG"
        />
      </label>

      <div className="mt-4 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm">
        <p className="font-medium text-foreground">{getStatusLabel(status)}</p>

        {status === "uploading" ? (
          <p className="mt-1 text-xs text-muted-foreground">
            El backend está extrayendo texto, generando chunks e indexando embeddings.
          </p>
        ) : null}

        {lastUpload ? (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Archivo: <strong>{lastUpload.filename}</strong> · Chunks: {lastUpload.chunksCount} · ID:{" "}
            {lastUpload.documentId}
          </p>
        ) : null}

        {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
      </div>
    </aside>
  );
}
