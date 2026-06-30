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

describe("GET /api/documents", () => {
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

  it("reenvía filtros al backend RAG y normaliza la respuesta", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              document_id: 23,
              title: "lia_plan_apoyo_estudiantil",
              source: "upload:lia_plan_apoyo_estudiantil.docx",
              filename: "lia_plan_apoyo_estudiantil.docx",
              extension: "docx",
              status: "indexed",
              chunks_count: 7,
              content_chars: 2350,
              created_at: "2026-06-25T15:24:40.487019Z",
            },
          ],
          total: 1,
          limit: 8,
          offset: 0,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const response = await GET(
      new Request("http://localhost:3000/api/documents?query=apoyo&extension=docx&limit=8"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockedFetch).toHaveBeenCalledWith(
      "http://localhost:8000/documents?query=apoyo&extension=docx&limit=8",
      expect.objectContaining({
        method: "GET",
        headers: { "x-api-key": "test-api-key" },
        cache: "no-store",
      }),
    );
    expect(data.items[0].documentId).toBe(23);
    expect(data.items[0].chunksCount).toBe(7);
  });
});
