import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentLibraryPanel } from "../DocumentLibraryPanel";
import {
  getDocumentDetail,
  listDocuments,
  reindexDocument,
} from "@/lib/documentLibraryClient";

jest.mock("@/lib/documentLibraryClient", () => ({
  getDocumentDetail: jest.fn(),
  listDocuments: jest.fn(),
  reindexDocument: jest.fn(),
}));

const mockedListDocuments = listDocuments as jest.MockedFunction<typeof listDocuments>;
const mockedGetDocumentDetail = getDocumentDetail as jest.MockedFunction<typeof getDocumentDetail>;
const mockedReindexDocument = reindexDocument as jest.MockedFunction<typeof reindexDocument>;

const documentItem = {
  documentId: 23,
  title: "lia_plan_apoyo_estudiantil",
  source: "upload:lia_plan_apoyo_estudiantil.docx",
  filename: "lia_plan_apoyo_estudiantil.docx",
  extension: "docx",
  status: "indexed" as const,
  chunksCount: 7,
  contentChars: 2350,
  createdAt: "2026-06-25T15:24:40.487019Z",
};

describe("DocumentLibraryPanel", () => {
  beforeEach(() => {
    mockedListDocuments.mockReset();
    mockedGetDocumentDetail.mockReset();
    mockedReindexDocument.mockReset();

    mockedListDocuments.mockResolvedValue({
      items: [documentItem],
      total: 1,
      limit: 8,
      offset: 0,
    });
    mockedGetDocumentDetail.mockResolvedValue({
      ...documentItem,
      contentPreview: "Contenido institucional de prueba",
      chunks: [
        {
          chunkId: 76,
          chunkIndex: 0,
          contentPreview: "Primer chunk documental",
          createdAt: "2026-06-25T15:24:40.489897Z",
        },
      ],
    });
    mockedReindexDocument.mockResolvedValue({
      documentId: 23,
      title: "lia_plan_apoyo_estudiantil",
      source: "upload:lia_plan_apoyo_estudiantil.docx",
      status: "indexed",
      chunksCount: 7,
      message: "Documento reindexado correctamente.",
    });
  });

  it("lista documentos y muestra detalle", async () => {
    const user = userEvent.setup();

    render(<DocumentLibraryPanel />);

    expect(await screen.findByText("lia_plan_apoyo_estudiantil")).toBeInTheDocument();
    expect(screen.getByText(/Total: 1/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Ver detalle/i }));

    expect(await screen.findByText(/Contenido institucional de prueba/i)).toBeInTheDocument();
    expect(screen.getByText(/Primer chunk documental/i)).toBeInTheDocument();
  });

  it("aplica filtros y reindexa", async () => {
    const user = userEvent.setup();

    render(<DocumentLibraryPanel />);

    await screen.findByText("lia_plan_apoyo_estudiantil");

    await user.type(screen.getByPlaceholderText("Título, archivo u origen"), "apoyo");
    await user.selectOptions(screen.getByLabelText(/Extensión/i), "docx");
    await user.click(screen.getByRole("button", { name: /Aplicar filtros/i }));

    await waitFor(() => {
      expect(mockedListDocuments).toHaveBeenLastCalledWith(
        expect.objectContaining({ query: "apoyo", extension: "docx" }),
      );
    });

    await user.click(screen.getByRole("button", { name: /Reindexar/i }));

    expect(await screen.findByText(/Documento reindexado correctamente/i)).toBeInTheDocument();
    expect(mockedReindexDocument).toHaveBeenCalledWith(23);
  });
});
