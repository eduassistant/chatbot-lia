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

describe("GET /api/admin/feedback", () => {
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

  it("reenvía filtros con headers admin y normaliza feedback", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: 6,
              trace_id: "trace-1",
              feedback: "needs_human_support",
              comment: null,
              source: "chatbot-lia",
              user_identifier: null,
              question: "Necesito apoyo humano",
              response_preview: "Podemos registrar un caso.",
              metadata: { feedback_version: "1.0" },
              created_at: "2026-06-15T10:11:26.991095Z",
            },
          ],
          total: 1,
          page: 1,
          page_size: 10,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const response = await GET(new Request("http://localhost:3000/api/admin/feedback?page=1&page_size=10&feedback=needs_human_support"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockedFetch).toHaveBeenCalledWith(
      "http://localhost:8000/admin/feedback?page=1&page_size=10&feedback=needs_human_support",
      expect.objectContaining({
        method: "GET",
        headers: { "x-api-key": "test-api-key", "x-admin-role": "admin" },
        cache: "no-store",
      }),
    );
    expect(data.items[0].traceId).toBe("trace-1");
    expect(data.items[0].responsePreview).toBe("Podemos registrar un caso.");
    expect(data.pageSize).toBe(10);
  });
});
