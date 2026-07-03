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

describe("GET /api/admin/cases", () => {
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

  it("normaliza casos sensibles", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: 2,
              case_id: "case-1",
              trace_id: "trace-1",
              feedback_id: 6,
              trigger_source: "feedback",
              status: "open",
              risk_level: "high",
              recommended_action: "human_support_required",
              reason: "El usuario solicitó hablar con una persona.",
              resolution_note: null,
              safety: {},
              metadata: { case_version: "1.0" },
              created_at: "2026-06-15T10:11:27.132519Z",
              updated_at: "2026-06-15T10:11:27.132522Z",
            },
          ],
          total: 1,
          page: 1,
          page_size: 10,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const response = await GET(new Request("http://localhost:3000/api/admin/cases?status=open"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items[0].caseId).toBe("case-1");
    expect(data.items[0].recommendedAction).toBe("human_support_required");
  });
});
