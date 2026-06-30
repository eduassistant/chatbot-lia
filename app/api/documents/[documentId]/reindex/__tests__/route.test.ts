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

describe("POST /api/documents/[documentId]/reindex", () => {
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

  it("reenvía reindexado al backend RAG", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          document_id: 23,
          title: "lia_plan_apoyo_estudiantil",
          source: "upload:lia_plan_apoyo_estudiantil.docx",
          status: "indexed",
          chunks_count: 7,
          message: "Documento reindexado correctamente.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const response = await POST(new Request("http://localhost:3000/api/documents/23/reindex"), {
      params: { documentId: "23" },
    });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockedFetch).toHaveBeenCalledWith(
      "http://localhost:8000/documents/23/reindex",
      expect.objectContaining({ method: "POST", headers: { "x-api-key": "test-api-key" } }),
    );
    expect(data.message).toBe("Documento reindexado correctamente.");
    expect(data.chunksCount).toBe(7);
  });
});
