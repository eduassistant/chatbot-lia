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

import { POST } from "../route";

const mockedFetch = jest.fn();

describe("POST /api/feedback", () => {
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

  it("reenvía el feedback al backend RAG y normaliza la respuesta", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 7,
          trace_id: "trace-123",
          feedback: "useful",
          message: "Feedback registrado correctamente.",
          case_id: "case-123",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const request = new Request("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ traceId: "trace-123", feedback: "useful", source: "chatbot-lia" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockedFetch).toHaveBeenCalledWith(
      "http://localhost:8000/feedback",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "test-api-key",
        },
        body: JSON.stringify({
          trace_id: "trace-123",
          feedback: "useful",
          source: "chatbot-lia",
        }),
      }),
    );
    expect(data).toEqual({
      id: 7,
      traceId: "trace-123",
      feedback: "useful",
      message: "Feedback registrado correctamente.",
      caseId: "case-123",
    });
  });

  it("devuelve error 400 cuando el feedback no es válido", async () => {
    const request = new Request("http://localhost:3000/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ traceId: "trace-123", feedback: "human_help" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("El feedback debe incluir traceId y un valor válido.");
    expect(mockedFetch).not.toHaveBeenCalled();
  });
});
