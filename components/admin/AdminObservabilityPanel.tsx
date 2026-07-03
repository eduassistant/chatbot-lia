"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  listAdminCases,
  listAdminFeedback,
  listAdminRagTraces,
} from "@/lib/adminObservabilityClient";
import type {
  AdminCaseItem,
  AdminFeedbackItem,
  AdminObservabilityView,
  AdminPaginationResponse,
  AdminRagTraceItem,
} from "@/lib/types";

const PAGE_SIZE = 5;

const tabs: Array<{ id: AdminObservabilityView; label: string; description: string }> = [
  {
    id: "feedback",
    label: "Feedback",
    description: "Respuestas útiles, insuficientes o que solicitan apoyo humano.",
  },
  {
    id: "rag-traces",
    label: "Trazas RAG",
    description: "Consultas, fuentes recuperadas, scores, safety y latencia.",
  },
  {
    id: "cases",
    label: "Casos sensibles",
    description: "Casos escalados por feedback, safety o carga manual.",
  },
];

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

function compactJson(value: Record<string, unknown>) {
  const entries = Object.entries(value).slice(0, 3);

  if (!entries.length) {
    return "Sin metadata";
  }

  return entries
    .map(([key, entryValue]) => `${key}: ${typeof entryValue === "object" ? JSON.stringify(entryValue) : String(entryValue)}`)
    .join(" · ");
}

function asText(value?: string | null, fallback = "Sin dato") {
  return value && value.trim() ? value : fallback;
}

function getRiskLabel(value?: string | null) {
  if (!value) {
    return "Sin riesgo";
  }

  return value;
}

function getActiveTabDescription(activeTab: AdminObservabilityView) {
  return tabs.find((tab) => tab.id === activeTab)?.description ?? "Observabilidad administrativa.";
}

export function AdminObservabilityPanel() {
  const [activeTab, setActiveTab] = useState<AdminObservabilityView>("feedback");
  const [queryDraft, setQueryDraft] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [riskLevel, setRiskLevel] = useState("");
  const [eventType, setEventType] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [page, setPage] = useState(1);
  const [feedbackData, setFeedbackData] = useState<AdminPaginationResponse<AdminFeedbackItem> | null>(null);
  const [traceData, setTraceData] = useState<AdminPaginationResponse<AdminRagTraceItem> | null>(null);
  const [caseData, setCaseData] = useState<AdminPaginationResponse<AdminCaseItem> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeData = activeTab === "feedback" ? feedbackData : activeTab === "rag-traces" ? traceData : caseData;
  const total = activeData?.total ?? 0;
  const pageSize = activeData?.pageSize ?? PAGE_SIZE;
  const currentPage = activeData?.page ?? page;
  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const activeFiltersLabel = useMemo(() => {
    const activeFilters = [];

    if (query) {
      activeFilters.push(`búsqueda: ${query}`);
    }

    if (status) {
      activeFilters.push(`estado: ${status}`);
    }

    if (riskLevel) {
      activeFilters.push(`riesgo: ${riskLevel}`);
    }

    if (eventType) {
      activeFilters.push(`evento: ${eventType}`);
    }

    if (createdFrom) {
      activeFilters.push(`desde: ${createdFrom}`);
    }

    if (createdTo) {
      activeFilters.push(`hasta: ${createdTo}`);
    }

    return activeFilters.length ? activeFilters.join(" · ") : "Sin filtros activos";
  }, [createdFrom, createdTo, eventType, query, riskLevel, status]);

  async function loadCurrentView(nextPage = page) {
    setIsLoading(true);
    setError(null);

    const filters = {
      page: nextPage,
      pageSize: PAGE_SIZE,
      query,
      createdFrom,
      createdTo,
      status: activeTab === "feedback" ? undefined : status,
      feedback: activeTab === "feedback" ? eventType || status : undefined,
      eventType: eventType || undefined,
      riskLevel: activeTab === "feedback" ? undefined : riskLevel,
      triggerSource: activeTab === "cases" ? eventType : undefined,
    };

    try {
      if (activeTab === "feedback") {
        const result = await listAdminFeedback(filters);
        setFeedbackData(result);
        setPage(result.page);
      } else if (activeTab === "rag-traces") {
        const result = await listAdminRagTraces(filters);
        setTraceData(result);
        setPage(result.page);
      } else {
        const result = await listAdminCases(filters);
        setCaseData(result);
        setPage(result.page);
      }
    } catch (unknownError) {
      const errorMessage = unknownError instanceof Error ? unknownError.message : "No pudimos cargar observabilidad.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  function handleTabChange(tab: AdminObservabilityView) {
    setActiveTab(tab);
    setPage(1);
    setError(null);
  }

  function handleApplyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(queryDraft.trim());
    setPage(1);
  }

  function handleClearFilters() {
    setQueryDraft("");
    setQuery("");
    setStatus("");
    setRiskLevel("");
    setEventType("");
    setCreatedFrom("");
    setCreatedTo("");
    setPage(1);
  }

  useEffect(() => {
    void loadCurrentView(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, query, status, riskLevel, eventType, createdFrom, createdTo, page]);

  return (
    <section className="rounded-2xl border border-border bg-white p-5 shadow-soft" aria-labelledby="admin-observability-title">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Observabilidad admin</p>
        <h2 id="admin-observability-title" className="mt-2 text-lg font-semibold text-foreground">
          Panel de feedback, trazas y casos
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{getActiveTabDescription(activeTab)}</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-muted p-1" role="tablist" aria-label="Vistas admin">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`rounded-xl px-2 py-2 text-xs font-semibold transition ${
              activeTab === tab.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form className="mt-4 space-y-3" onSubmit={handleApplyFilters}>
        <label className="block text-xs font-semibold text-foreground" htmlFor="admin-search">
          Buscar
        </label>
        <input
          id="admin-search"
          value={queryDraft}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setQueryDraft(event.target.value)}
          placeholder="trace, pregunta, comentario o motivo"
          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary"
        />

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-semibold text-foreground">
            Desde
            <input
              type="date"
              value={createdFrom}
              onChange={(event) => {
                setCreatedFrom(event.target.value);
                setPage(1);
              }}
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm font-normal text-foreground outline-none transition focus:border-primary"
            />
          </label>
          <label className="block text-xs font-semibold text-foreground">
            Hasta
            <input
              type="date"
              value={createdTo}
              onChange={(event) => {
                setCreatedTo(event.target.value);
                setPage(1);
              }}
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm font-normal text-foreground outline-none transition focus:border-primary"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs font-semibold text-foreground">
            Estado / feedback
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm font-normal text-foreground outline-none transition focus:border-primary"
            >
              <option value="">Todos</option>
              {activeTab === "feedback" ? (
                <>
                  <option value="useful">useful</option>
                  <option value="insufficient">insufficient</option>
                  <option value="needs_human_support">needs_human_support</option>
                </>
              ) : activeTab === "rag-traces" ? (
                <>
                  <option value="success">success</option>
                  <option value="error">error</option>
                </>
              ) : (
                <>
                  <option value="open">open</option>
                  <option value="in_review">in_review</option>
                  <option value="resolved">resolved</option>
                </>
              )}
            </select>
          </label>

          <label className="block text-xs font-semibold text-foreground">
            Riesgo
            <select
              value={riskLevel}
              disabled={activeTab === "feedback"}
              onChange={(event) => {
                setRiskLevel(event.target.value);
                setPage(1);
              }}
              className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm font-normal text-foreground outline-none transition focus:border-primary disabled:bg-muted disabled:text-muted-foreground"
            >
              <option value="">Todos</option>
              <option value="none">none</option>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </label>
        </div>

        <label className="block text-xs font-semibold text-foreground">
          Tipo de evento / origen
          <input
            value={eventType}
            onChange={(event) => {
              setEventType(event.target.value);
              setPage(1);
            }}
            placeholder={activeTab === "cases" ? "feedback, safety o manual" : "tipo operativo"}
            className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm font-normal text-foreground outline-none transition focus:border-primary"
          />
        </label>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:opacity-90">
            Aplicar filtros
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={() => void loadCurrentView(page)}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary"
          >
            Actualizar
          </button>
        </div>
      </form>

      <p className="mt-3 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground">{activeFiltersLabel}</p>

      {error ? <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

      <div className="mt-4 space-y-3" aria-live="polite">
        {isLoading ? <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">Cargando observabilidad...</p> : null}
        {!isLoading && activeData?.items.length === 0 ? (
          <p className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">No hay registros para los filtros aplicados.</p>
        ) : null}

        {activeTab === "feedback" ? feedbackData?.items.map((item) => <FeedbackCard key={item.id} item={item} />) : null}
        {activeTab === "rag-traces" ? traceData?.items.map((item) => <TraceCard key={item.id} item={item} />) : null}
        {activeTab === "cases" ? caseData?.items.map((item) => <CaseCard key={item.id} item={item} />) : null}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
        <span>
          Página {currentPage} de {totalPages} · Total {total}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={!canGoPrevious || isLoading}
            onClick={() => setPage((value) => Math.max(value - 1, 1))}
            className="rounded-full border border-border px-3 py-1 font-semibold text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={!canGoNext || isLoading}
            onClick={() => setPage((value) => value + 1)}
            className="rounded-full border border-border px-3 py-1 font-semibold text-foreground transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>
  );
}

function FeedbackCard({ item }: { item: AdminFeedbackItem }) {
  return (
    <article className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{item.feedback}</h3>
          <p className="mt-1 truncate text-xs text-muted-foreground">Trace: {asText(item.traceId)}</p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">{formatDate(item.createdAt)}</span>
      </div>
      <p className="mt-3 text-xs font-semibold text-foreground">Consulta asociada</p>
      <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{asText(item.question)}</p>
      <p className="mt-3 text-xs font-semibold text-foreground">Respuesta</p>
      <p className="mt-1 line-clamp-4 text-xs leading-relaxed text-muted-foreground">{asText(item.responsePreview)}</p>
      <p className="mt-3 text-[11px] text-muted-foreground">Fuente: {asText(item.source)} · Usuario: {asText(item.userIdentifier)}</p>
      {item.comment ? <p className="mt-2 rounded-lg bg-muted p-2 text-xs text-muted-foreground">Comentario: {item.comment}</p> : null}
    </article>
  );
}

function TraceCard({ item }: { item: AdminRagTraceItem }) {
  return (
    <article className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{item.status} · {getRiskLabel(item.riskLevel)}</h3>
          <p className="mt-1 truncate text-xs text-muted-foreground">Trace: {item.traceId}</p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">{item.durationMs} ms</span>
      </div>
      <p className="mt-3 text-xs font-semibold text-foreground">Consulta</p>
      <p className="mt-1 line-clamp-3 text-xs leading-relaxed text-muted-foreground">{asText(item.question)}</p>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div><dt className="font-semibold text-foreground">Fuentes</dt><dd>{item.sourcesCount}</dd></div>
        <div><dt className="font-semibold text-foreground">Chunks</dt><dd>{item.retrievalCount}</dd></div>
        <div><dt className="font-semibold text-foreground">Escala</dt><dd>{item.escalationRequired ? "Sí" : "No"}</dd></div>
      </dl>
      <p className="mt-3 text-xs font-semibold text-foreground">Top fuentes</p>
      <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
        {item.sources.slice(0, 3).map((source, index) => (
          <li key={`${item.traceId}-${index}`} className="rounded-lg bg-muted/50 px-2 py-1">
            {typeof source.title === "string" ? source.title : "Fuente sin título"}
            {typeof source.relevance_score === "number" ? ` · score ${source.relevance_score.toFixed(3)}` : ""}
          </li>
        ))}
        {!item.sources.length ? <li>Sin fuentes registradas.</li> : null}
      </ul>
      <p className="mt-3 text-[11px] text-muted-foreground">Modelo: {asText(item.llmProvider)} / {asText(item.llmModel)} · {formatDate(item.createdAt)}</p>
    </article>
  );
}

function CaseCard({ item }: { item: AdminCaseItem }) {
  return (
    <article className="rounded-xl border border-border bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{item.status} · {item.triggerSource}</h3>
          <p className="mt-1 truncate text-xs text-muted-foreground">Caso: {item.caseId}</p>
        </div>
        <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">{getRiskLabel(item.riskLevel)}</span>
      </div>
      <p className="mt-3 text-xs font-semibold text-foreground">Motivo</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.reason}</p>
      {item.resolutionNote ? (
        <p className="mt-3 rounded-lg bg-muted p-2 text-xs text-muted-foreground">Resolución: {item.resolutionNote}</p>
      ) : null}
      <p className="mt-3 text-[11px] text-muted-foreground">
        Acción: {asText(item.recommendedAction)} · Trace: {asText(item.traceId)} · {formatDate(item.createdAt)}
      </p>
      <p className="mt-2 text-[11px] text-muted-foreground">Metadata: {compactJson(item.metadata)}</p>
    </article>
  );
}
