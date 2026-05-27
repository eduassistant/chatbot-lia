import type { Source } from "@/lib/types";
import { SourceCard } from "./SourceCard";

interface SourcesPanelProps {
  sources: Source[];
}

export function SourcesPanel({ sources }: SourcesPanelProps) {
  return (
    <aside className="rounded-2xl border border-border bg-white p-5 shadow-soft lg:sticky lg:top-6 lg:self-start">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-primary" aria-hidden="true">
          ◉
        </span>
        <h2 className="text-lg font-semibold text-foreground">Fuentes recuperadas</h2>
      </div>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        Fragmentos utilizados por el RAG para construir la respuesta.
      </p>

      {sources.length > 0 ? (
        <div className="space-y-3">
          {sources.map((source) => (
            <SourceCard key={`${source.documentId}-${source.chunkId}-${source.chunkIndex}`} source={source} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-muted/50 px-4 py-8 text-center text-sm text-muted-foreground">
          Las fuentes aparecerán luego de enviar una consulta.
        </div>
      )}
    </aside>
  );
}
