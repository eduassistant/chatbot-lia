jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) => {
      const headers = new Headers(init?.headers);

      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }

      return new Response(JSON.stringify(body), {
        status: init?.status ?? 200,
        statusText: init?.statusText,
        headers,
      });
    },
  },
}));

import { GET } from "../route";

const mockedFetch = jest.fn();

describe("GET /api/admin/rag-traces", () => {
  const previousEnv = process.env;
  const previousFetch = global.fetch;

  beforeEach(() => {
    mockedFetch.mockReset();
    global.fetch = mockedFetch as unknown as typeof fetch;
    process.env = {
      ...previousEnv,
      RAG_API_URL: "http://localhost:8000",
      RAG_API_KEY: "test-api-key",
    };
  });

  afterEach(() => {
    process.env = previousEnv;
    global.fetch = previousFetch;
  });

  it("normaliza trazas RAG con fuentes y métricas", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: 10,
              trace_id: "trace-rag",
              status: "success",
              question: "¿Qué recomienda LIA?",
              response_preview: "Respuesta empática.",
              risk_level: "medium",
              recommended_action: "human_support_suggested",
              escalation_required: false,
              sources_count: 3,
              retrieval_count: 3,
              duration_ms: 15263,
              llm_provider: "github",
              llm_model: "openai/gpt-4.1-mini",
              error_type: null,
              error_message: null,
              retrieved_chunks: [{ document_id: 10, relevance_score: 0.55 }],
              sources: [{ title: "Bullying convivencia", relevance_score: 0.55 }],
              safety: { risk_level: "medium" },
              metadata: { trace_version: "1.0" },
              created_at: "2026-06-30T10:07:09.926642Z",
            },
          ],
          total: 1,
          page: 1,
          page_size: 10,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const response = await GET(new Request("http://localhost:3000/api/admin/rag-traces?risk_level=medium"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items[0].traceId).toBe("trace-rag");
    expect(data.items[0].durationMs).toBe(15263);
    expect(data.items[0].sources[0].title).toBe("Bullying convivencia");
  });
});
