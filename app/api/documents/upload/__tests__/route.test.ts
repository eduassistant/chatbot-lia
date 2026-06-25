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

function buildMultipartRequest(formData: FormData): Request {
  return {
    formData: jest.fn().mockResolvedValue(formData),
  } as unknown as Request;
}


describe("POST /api/documents/upload", () => {
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

  it("reenvía el archivo al backend RAG y normaliza la respuesta", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          document_id: 11,
          title: "guia_bienestar",
          filename: "guia_bienestar.pdf",
          content_type: "application/pdf",
          extension: "pdf",
          chunks_count: 3,
          status: "indexed",
          message: "Documento cargado e indexado correctamente.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const formData = new FormData();
    formData.append("file", new File(["pdf"], "guia_bienestar.pdf", { type: "application/pdf" }));

    const response = await POST(buildMultipartRequest(formData));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockedFetch).toHaveBeenCalledWith(
      "http://localhost:8000/documents/upload",
      expect.objectContaining({
        method: "POST",
        headers: { "x-api-key": "test-api-key" },
        body: expect.any(FormData),
      }),
    );
    expect(data).toEqual({
      documentId: 11,
      title: "guia_bienestar",
      filename: "guia_bienestar.pdf",
      contentType: "application/pdf",
      extension: "pdf",
      chunksCount: 3,
      status: "indexed",
      message: "Documento cargado e indexado correctamente.",
    });
  });

  it("devuelve error 400 si falta el archivo", async () => {
    const response = await POST(buildMultipartRequest(new FormData()));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("El campo file es requerido.");
    expect(mockedFetch).not.toHaveBeenCalled();
  });
});
