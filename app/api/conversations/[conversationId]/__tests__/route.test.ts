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

const conversationId = "550e8400-e29b-41d4-a716-446655440000";

describe("GET /api/conversations/[conversationId]", () => {
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

  it("recupera y normaliza historial desde rag-lia", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          conversation_id: conversationId,
          status: "active",
          message_count: 2,
          expires_at: null,
          message: "Conversación encontrada.",
          messages: [
            {
              id: 1,
              role: "user",
              content: "Hola",
              trace_id: null,
              case_id: null,
              sources: [],
              safety: {},
              created_at: "2026-06-22T06:20:00Z",
            },
            {
              id: 2,
              role: "assistant",
              content: "Hola, soy LIA.",
              trace_id: "trace-history-001",
              case_id: null,
              sources: [
                {
                  document_id: 1,
                  chunk_id: 2,
                  chunk_index: 0,
                  distance: 0.2,
                  title: "Guía de apoyo",
                  fragment: "Fragmento de apoyo",
                },
              ],
              safety: {},
              created_at: "2026-06-22T06:21:00Z",
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const response = await GET(new Request(`http://localhost:3000/api/conversations/${conversationId}`), {
      params: { conversationId },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockedFetch).toHaveBeenCalledWith(
      `http://localhost:8000/conversations/${conversationId}`,
      expect.objectContaining({
        method: "GET",
        headers: { "x-api-key": "test-api-key" },
        cache: "no-store",
      }),
    );
    expect(data.conversationId).toBe(conversationId);
    expect(data.messages).toHaveLength(2);
    expect(data.messages[1].traceId).toBe("trace-history-001");
    expect(data.messages[1].sources[0].title).toBe("Guía de apoyo");
  });

  it("propaga 404 cuando no existe historial", async () => {
    mockedFetch.mockResolvedValue(
      new Response(JSON.stringify({ detail: "No se encontró la conversación solicitada." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const response = await GET(new Request(`http://localhost:3000/api/conversations/${conversationId}`), {
      params: { conversationId },
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe("No se encontró la conversación solicitada.");
  });
});
