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

describe("GET /api/documents/[documentId]", () => {
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

  it("normaliza detalle documental", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          document_id: 23,
          title: "lia_plan_apoyo_estudiantil",
          source: "upload:lia_plan_apoyo_estudiantil.docx",
          filename: "lia_plan_apoyo_estudiantil.docx",
          extension: "docx",
          status: "indexed",
          chunks_count: 7,
          content_chars: 2350,
          created_at: "2026-06-25T15:24:40.487019Z",
          content_preview: "Contenido del documento",
          chunks: [
            {
              chunk_id: 76,
              chunk_index: 0,
              content_preview: "Primer chunk",
              created_at: "2026-06-25T15:24:40.489897Z",
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const response = await GET(new Request("http://localhost:3000/api/documents/23"), {
      params: { documentId: "23" },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockedFetch).toHaveBeenCalledWith(
      "http://localhost:8000/documents/23",
      expect.objectContaining({ method: "GET", headers: { "x-api-key": "test-api-key" } }),
    );
    expect(data.documentId).toBe(23);
    expect(data.chunks[0].chunkId).toBe(76);
  });
});
