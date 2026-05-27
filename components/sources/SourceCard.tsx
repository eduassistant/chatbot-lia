import type { Source } from "@/lib/types";

interface SourceCardProps {
  source: Source;
}

export function SourceCard({ source }: SourceCardProps) {
  return (
    <article className="rounded-xl border border-border bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          <span aria-hidden="true">▤</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="mb-1 text-sm font-semibold text-foreground">{source.title}</h3>
          <span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Score: {source.score.toFixed(2)}
          </span>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{source.fragment}</p>
    </article>
  );
}
