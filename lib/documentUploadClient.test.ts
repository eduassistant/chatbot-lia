import { DocumentUploadClientError, uploadDocument, validateDocumentFile } from "./documentUploadClient";

const mockedFetch = jest.fn();

describe("documentUploadClient", () => {
  const previousFetch = global.fetch;

  beforeEach(() => {
    mockedFetch.mockReset();
    global.fetch = mockedFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = previousFetch;
  });

  it("valida formatos no soportados", () => {
    const file = new File(["contenido"], "archivo.exe", { type: "application/octet-stream" });

    expect(() => validateDocumentFile(file)).toThrow(DocumentUploadClientError);
  });

  it("sube un documento y normaliza la respuesta", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          documentId: 10,
          title: "guia",
          filename: "guia.txt",
          contentType: "text/plain",
          extension: "txt",
          chunksCount: 2,
          status: "indexed",
          message: "Documento cargado e indexado correctamente.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await uploadDocument(new File(["contenido"], "guia.txt", { type: "text/plain" }));

    expect(mockedFetch).toHaveBeenCalledWith(
      "/api/documents/upload",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      }),
    );
    expect(result.documentId).toBe(10);
    expect(result.filename).toBe("guia.txt");
    expect(result.chunksCount).toBe(2);
  });
});
