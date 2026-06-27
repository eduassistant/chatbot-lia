import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentUploadPanel } from "../DocumentUploadPanel";

jest.mock("@/lib/documentUploadClient", () => ({
  uploadDocument: jest.fn().mockResolvedValue({
    documentId: 10,
    title: "guia",
    filename: "guia.txt",
    contentType: "text/plain",
    extension: "txt",
    chunksCount: 2,
    status: "indexed",
    message: "Documento cargado e indexado correctamente.",
  }),
}));

describe("DocumentUploadPanel", () => {
  it("permite seleccionar un documento y muestra resultado", async () => {
    const user = userEvent.setup();

    render(<DocumentUploadPanel />);

    const input = screen.getByLabelText("Seleccionar documento para cargar al RAG");
    await user.upload(input, new File(["contenido"], "guia.txt", { type: "text/plain" }));

    expect(await screen.findByText(/Documento indexado correctamente/i)).toBeInTheDocument();
    expect(screen.getByText(/guia.txt/i)).toBeInTheDocument();
    expect(screen.getByText(/Chunks: 2/i)).toBeInTheDocument();
  });
});
