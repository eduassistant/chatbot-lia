import {
  DocumentLibraryClientError,
  getDocumentDetail,
  listDocuments,
  reindexDocument,
} from "../documentLibraryClient";

const mockedFetch = jest.fn();

const documentItem = {
  documentId: 23,
  title: "lia_plan_apoyo_estudiantil",
  source: "upload:lia_plan_apoyo_estudiantil.docx",
  filename: "lia_plan_apoyo_estudiantil.docx",
  extension: "docx",
  status: "indexed",
  chunksCount: 7,
  contentChars: 2350,
  createdAt: "2026-06-25T15:24:40.487019Z",
};

describe("documentLibraryClient", () => {
  const previousFetch = global.fetch;

  beforeEach(() => {
    mockedFetch.mockReset();
    global.fetch = mockedFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = previousFetch;
  });

  it("lista documentos con filtros", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [documentItem],
          total: 1,
          limit: 8,
          offset: 0,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await listDocuments({
      query: "apoyo",
      status: "indexed",
      extension: "docx",
      limit: 8,
      offset: 0,
    });

    expect(mockedFetch).toHaveBeenCalledWith(
      "/api/documents?query=apoyo&status=indexed&extension=docx&limit=8&offset=0",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(result.items[0].documentId).toBe(23);
    expect(result.total).toBe(1);
  });

  it("obtiene detalle documental", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          ...documentItem,
          contentPreview: "Contenido del documento",
          chunks: [
            {
              chunkId: 76,
              chunkIndex: 0,
              contentPreview: "Primer chunk",
              createdAt: "2026-06-25T15:24:40.489897Z",
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await getDocumentDetail(23);

    expect(mockedFetch).toHaveBeenCalledWith(
      "/api/documents/23",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(result.chunks[0].contentPreview).toBe("Primer chunk");
  });

  it("reindexa documentos", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          documentId: 23,
          title: "lia_plan_apoyo_estudiantil",
          source: "upload:lia_plan_apoyo_estudiantil.docx",
          status: "indexed",
          chunksCount: 7,
          message: "Documento reindexado correctamente.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await reindexDocument(23);

    expect(mockedFetch).toHaveBeenCalledWith(
      "/api/documents/23/reindex",
      expect.objectContaining({ method: "POST", cache: "no-store" }),
    );
    expect(result.message).toBe("Documento reindexado correctamente.");
  });

  it("propaga errores de API", async () => {
    mockedFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: "Filtro inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(listDocuments({ extension: "docx" })).rejects.toThrow(
      DocumentLibraryClientError,
    );
  });
});
