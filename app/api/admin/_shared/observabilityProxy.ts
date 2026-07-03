import { NextResponse } from "next/server";

export type AdminEndpoint = "feedback" | "rag-traces" | "cases";

interface AdminProxyOptions<TPayload, TOutput> {
  endpoint: AdminEndpoint;
  validate: (payload: unknown) => payload is TPayload;
  normalize: (payload: TPayload) => TOutput;
  fallbackError: string;
  unexpectedFormatError: string;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function isPlainRecordArray(value: unknown): value is Array<Record<string, unknown>> {
  return Array.isArray(value) && value.every(isRecord);
}

export function isOptionalString(value: unknown): value is string | null | undefined {
  return typeof value === "string" || value === null || value === undefined;
}

export function isOptionalNumber(value: unknown): value is number | null | undefined {
  return typeof value === "number" || value === null || value === undefined;
}

export function isRecordOrMissing(value: unknown): value is Record<string, unknown> | undefined {
  return value === undefined || isRecord(value);
}

export function isPaginatedPayload<TItem>(
  value: unknown,
  itemGuard: (item: unknown) => item is TItem,
): value is { items: TItem[]; total: number; page: number; page_size: number } {
  if (!isRecord(value)) {
    return false;
  }

  return (
    Array.isArray(value.items) &&
    value.items.every(itemGuard) &&
    typeof value.total === "number" &&
    typeof value.page === "number" &&
    typeof value.page_size === "number"
  );
}

function getRagConfig() {
  return {
    apiUrl: process.env.RAG_API_URL?.replace(/\/+$/, ""),
    apiKey: process.env.RAG_API_KEY,
  };
}

async function readJsonSafely(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function getUpstreamError(payload: unknown, fallback: string) {
  if (isRecord(payload)) {
    if (typeof payload.detail === "string") {
      return payload.detail;
    }

    if (Array.isArray(payload.detail)) {
      return "El backend RAG rechazó los filtros de observabilidad.";
    }
  }

  return fallback;
}

export async function proxyAdminObservabilityRequest<TPayload, TOutput>(
  request: Request,
  options: AdminProxyOptions<TPayload, TOutput>,
) {
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
  const upstreamUrl = new URL(`${apiUrl}/admin/${options.endpoint}`);

  for (const [key, value] of requestUrl.searchParams.entries()) {
    upstreamUrl.searchParams.set(key, value);
  }

  let ragResponse: Response;

  try {
    ragResponse = await fetch(upstreamUrl.toString(), {
      method: "GET",
      headers: {
        "x-api-key": apiKey,
        "x-admin-role": "admin",
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
    return NextResponse.json(
      { error: getUpstreamError(ragPayload, options.fallbackError) },
      { status: ragResponse.status === 403 ? 403 : 502 },
    );
  }

  if (!options.validate(ragPayload)) {
    return NextResponse.json({ error: options.unexpectedFormatError }, { status: 502 });
  }

  return NextResponse.json(options.normalize(ragPayload));
}
