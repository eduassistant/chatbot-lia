"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  getDocumentDetail,
  listDocuments,
  reindexDocument,
} from "@/lib/documentLibraryClient";
import type {
  DocumentLibraryDetail,
  DocumentLibraryExtension,
  DocumentLibraryItem,
  DocumentLibraryListResponse,
  DocumentLibraryStatus,
} from "@/lib/types";

const PAGE_SIZE = 8;

function getStatusLabel(status: DocumentLibraryStatus) {
  if (status === "indexed") {
    return "Indexado";
  }

  return "Sin chunks";
}

function getExtensionLabel(extension?: string | null) {
  if (!extension) {
    return "sin extensión";
  }

  return extension.toUpperCase();
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export function DocumentLibraryPanel() {
  const [documents, setDocuments] = useState<DocumentLibraryListResponse | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentLibraryDetail | null>(null);
  const [queryDraft, setQueryDraft] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<DocumentLibraryStatus | "">("");
  const [extension, setExtension] = useState<DocumentLibraryExtension | "">("");
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [reindexingId, setReindexingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const total = documents?.total ?? 0;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(Math.ceil(total / PAGE_SIZE), 1);
  const canGoPrevious = offset > 0;
  const canGoNext = offset + PAGE_SIZE < total;

  const selectedDocumentId = selectedDocument?.documentId ?? null;

  const filtersLabel = useMemo(() => {
    const activeFilters = [];

    if (query) {
      activeFilters.push(`búsqueda: ${query}`);
    }

    if (status) {
      activeFilters.push(`estado: ${getStatusLabel(status)}`);
    }

    if (extension) {
      activeFilters.push(`extensión: ${extension.toUpperCase()}`);
    }

    return activeFilters.length ? activeFilters.join(" · ") : "Sin filtros activos";
  }, [extension, query, status]);

  async function loadDocuments(nextOffset = offset) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await listDocuments({
        query,
        status,
        extension,
        limit: PAGE_SIZE,
        offset: nextOffset,
      });

      setDocuments(result);
      setOffset(result.offset);

      if (selectedDocumentId && !result.items.some((item) => item.documentId === selectedDocumentId)) {
        setSelectedDocument(null);
      }
    } catch (unknownError) {
      const errorMessage =
        unknownError instanceof Error
          ? unknownError.message
          : "No pudimos cargar la biblioteca documental.";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSelectDocument(document: DocumentLibraryItem) {
    setIsDetailLoading(true);
    setError(null);
    setMessage(null);

    try {
      const detail = await getDocumentDetail(document.documentId);
      setSelectedDocument(detail);
    } catch (unknownError) {
      const errorMessage =
        unknownError instanceof Error
          ? unknownError.message
          : "No pudimos obtener el detalle del documento.";

      setError(errorMessage);
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function handleReindex(documentId: number) {
    setReindexingId(documentId);
    setError(null);
    setMessage(null);

    try {
      const result = await reindexDocument(documentId);
      setMessage(`${result.message} Chunks: ${result.chunksCount}.`);
      await loadDocuments(offset);

      if (selectedDocument?.documentId === documentId) {
        const detail = await getDocumentDetail(documentId);
        setSelectedDocument(detail);
      }
    } catch (unknownError) {
      const errorMessage =
        unknownError instanceof Error
          ? unknownError.message
          : "No pudimos reindexar el documento.";

      setError(errorMessage);
    } finally {
      setReindexingId(null);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(queryDraft.trim());
    setOffset(0);
  }

  function handleStatusChange(event: ChangeEvent<HTMLSelectElement>) {
    setStatus(event.target.value as DocumentLibraryStatus | "");
    setOffset(0);
  }

  function handleExtensionChange(event: ChangeEvent<HTMLSelectElement>) {
    setExtension(event.target.value as DocumentLibraryExtension | "");
    setOffset(0);
  }

  function handleClearFilters() {
    setQueryDraft("");
    setQuery("");
    setStatus("");
    setExtension("");
    setOffset(0);
  }

  function goPrevious() {
    const nextOffset = Math.max(offset - PAGE_SIZE, 0);
    setOffset(nextOffset);
  }

  function goNext() {
    const nextOffset = offset + PAGE_SIZE;
    setOffset(nextOffset);
  }

  useEffect(() => {
    void loadDocuments(offset);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status, extension, offset]);

  function renderSelectedDocumentDetail() {
    if (!selectedDocument) {
      return null;
    }

    return (
      <section className="mt-4 rounded-xl border border-border bg-muted/30 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-foreground" title={selectedDocument.title}>
              Detalle: {selectedDocument.title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {getExtensionLabel(selectedDocument.extension)} · {selectedDocument.chunksCount} chunks
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedDocument(null)}
            className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-secondary"
          >
            Cerrar
          </button>
        </div>

        <p className="rounded-lg bg-white p-3 text-xs leading-relaxed text-muted-foreground">
          {selectedDocument.contentPreview}
        </p>

        <div className="mt-3 space-y-2">
          {selectedDocument.chunks.map((chunk) => (
            <article key={chunk.chunkId} className="rounded-lg bg-white p-3 text-xs text-muted-foreground">
              <p className="mb-1 font-semibold text-foreground">Chunk #{chunk.chunkIndex}</p>
              <p className="leading-relaxed">{chunk.contentPreview}</p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <aside className="rounded-2xl border border-border bg-white p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-primary" aria-hidden="true">
            🗂️
          </span>
          <h2 className="text-lg font-semibold text-foreground">Biblioteca documental</h2>
        </div>
        <button
          type="button"
          onClick={() => void loadDocuments(offset)}
          disabled={isLoading}
          className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          Actualizar
        </button>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Consultá documentos indexados, revisá chunks y reindexá contenido existente del RAG.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Buscar
          <input
            value={queryDraft}
            onChange={(event) => setQueryDraft(event.target.value)}
            placeholder="Título, archivo u origen"
            className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm normal-case tracking-normal text-foreground outline-none transition focus:border-primary"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Estado
            <select
              value={status}
              onChange={handleStatusChange}
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm normal-case tracking-normal text-foreground outline-none transition focus:border-primary"
            >
              <option value="">Todos</option>
              <option value="indexed">Indexado</option>
              <option value="empty">Sin chunks</option>
            </select>
          </label>

          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Extensión
            <select
              value={extension}
              onChange={handleExtensionChange}
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm normal-case tracking-normal text-foreground outline-none transition focus:border-primary"
            >
              <option value="">Todas</option>
              <option value="txt">TXT</option>
              <option value="md">MD</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Aplicar filtros
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-secondary"
          >
            Limpiar
          </button>
        </div>
      </form>

      <div className="mt-4 rounded-xl border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        {filtersLabel}
      </div>

      {message ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isDetailLoading ? (
        <div className="mt-4 rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Cargando detalle del documento...
        </div>
      ) : null}

      <div className="mt-4 space-y-3" aria-live="polite">
        {isLoading ? (
          <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            Cargando biblioteca documental...
          </p>
        ) : null}

        {!isLoading && documents?.items.length === 0 ? (
          <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            No hay documentos para los filtros aplicados.
          </p>
        ) : null}

        {documents?.items.map((document) => (
          <article
            key={document.documentId}
            className={`rounded-xl border p-4 transition ${
              selectedDocument?.documentId === document.documentId
                ? "border-primary bg-secondary"
                : "border-border bg-white hover:bg-muted/40"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-foreground" title={document.title}>
                  {document.title}
                </h3>
                <p className="mt-1 truncate text-xs text-muted-foreground" title={document.filename ?? document.source}>
                  {document.filename ?? document.source}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                {getExtensionLabel(document.extension)}
              </span>
            </div>

            <dl className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
              <div>
                <dt className="font-semibold text-foreground">Estado</dt>
                <dd>{getStatusLabel(document.status)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Chunks</dt>
                <dd>{document.chunksCount}</dd>
              </div>
              <div>
                <dt className="font-semibold text-foreground">Caracteres</dt>
                <dd>{document.contentChars}</dd>
              </div>
            </dl>

            <p className="mt-2 text-[11px] text-muted-foreground">Creado: {formatDate(document.createdAt)}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleSelectDocument(document)}
                disabled={isDetailLoading}
                className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Ver detalle
              </button>
              <button
                type="button"
                onClick={() => void handleReindex(document.documentId)}
                disabled={reindexingId === document.documentId}
                className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reindexingId === document.documentId ? "Reindexando..." : "Reindexar"}
              </button>
            </div>

            {selectedDocument?.documentId === document.documentId ? renderSelectedDocumentDetail() : null}
          </article>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
        <span>
          Página {currentPage} de {totalPages} · Total: {total}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={goPrevious}
            disabled={!canGoPrevious || isLoading}
            className="rounded-full border border-border px-3 py-1 font-semibold transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext || isLoading}
            className="rounded-full border border-border px-3 py-1 font-semibold transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>

      {/* El detalle se renderiza inline debajo del documento seleccionado. */}
    </aside>
  );
}
