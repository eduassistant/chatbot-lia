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

describe("POST /api/chat", () => {
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

  it("reenvía el mensaje al backend RAG y normaliza las fuentes", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          response: "Respuesta real del RAG",
          sources: [
            {
              document_id: 1,
              chunk_id: 10,
              chunk_index: 0,
              distance: 0.12,
            },
          ],
          trace_id: "trace-123",
          case_id: "case-chat-123",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "¿Cómo puedo organizarme mejor?" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockedFetch).toHaveBeenCalledWith(
      "http://localhost:8000/chat",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "test-api-key",
        },
        body: JSON.stringify({ message: "¿Cómo puedo organizarme mejor?" }),
      }),
    );
    expect(data).toEqual({
      response: "Respuesta real del RAG",
      sources: [
        {
          documentId: 1,
          chunkId: 10,
          chunkIndex: 0,
          title: "Documento #1",
          fragment: "Fragmento #10",
          score: 0.12,
        },
      ],
      traceId: "trace-123",
      caseId: "case-chat-123",
    });
  });

  it("devuelve error 400 cuando el mensaje está vacío", async () => {
    const request = new Request("http://localhost:3000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "   " }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("El mensaje no puede estar vacío.");
    expect(mockedFetch).not.toHaveBeenCalled();
  });
});