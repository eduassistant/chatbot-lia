import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminObservabilityPanel } from "../AdminObservabilityPanel";
import {
  listAdminCases,
  listAdminFeedback,
  listAdminRagTraces,
} from "@/lib/adminObservabilityClient";

jest.mock("@/lib/adminObservabilityClient", () => ({
  listAdminCases: jest.fn(),
  listAdminFeedback: jest.fn(),
  listAdminRagTraces: jest.fn(),
}));

const mockedListAdminFeedback = listAdminFeedback as jest.MockedFunction<typeof listAdminFeedback>;
const mockedListAdminRagTraces = listAdminRagTraces as jest.MockedFunction<typeof listAdminRagTraces>;
const mockedListAdminCases = listAdminCases as jest.MockedFunction<typeof listAdminCases>;

describe("AdminObservabilityPanel", () => {
  beforeEach(() => {
    mockedListAdminFeedback.mockReset();
    mockedListAdminRagTraces.mockReset();
    mockedListAdminCases.mockReset();

    mockedListAdminFeedback.mockResolvedValue({
      items: [
        {
          id: 1,
          traceId: "trace-1",
          feedback: "useful",
          comment: null,
          source: "chatbot-lia",
          userIdentifier: null,
          question: "Necesito organizarme",
          responsePreview: "Respuesta clara",
          metadata: {},
          createdAt: "2026-06-12T10:19:06.637912Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 5,
    });

    mockedListAdminRagTraces.mockResolvedValue({
      items: [
        {
          id: 10,
          traceId: "trace-rag",
          status: "success",
          question: "Consulta RAG",
          responsePreview: "Respuesta RAG",
          riskLevel: "medium",
          recommendedAction: "human_support_suggested",
          escalationRequired: false,
          sourcesCount: 3,
          retrievalCount: 3,
          durationMs: 1200,
          llmProvider: "github",
          llmModel: "openai/gpt-4.1-mini",
          errorType: null,
          errorMessage: null,
          retrievedChunks: [],
          sources: [{ title: "Fuente A", relevance_score: 0.8 }],
          safety: {},
          metadata: {},
          createdAt: "2026-06-30T10:07:09.926642Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 5,
    });

    mockedListAdminCases.mockResolvedValue({
      items: [
        {
          id: 2,
          caseId: "case-1",
          traceId: "trace-1",
          feedbackId: 6,
          triggerSource: "feedback",
          status: "open",
          riskLevel: "high",
          recommendedAction: "human_support_required",
          reason: "Solicitó apoyo humano",
          resolutionNote: null,
          safety: {},
          metadata: {},
          createdAt: "2026-06-15T10:11:27.132519Z",
          updatedAt: "2026-06-15T10:11:27.132522Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 5,
    });
  });

  it("muestra feedback y cambia a trazas", async () => {
    const user = userEvent.setup();

    render(<AdminObservabilityPanel />);

    expect(await screen.findByText("Necesito organizarme")).toBeInTheDocument();
    expect(screen.getByText(/Respuesta clara/i)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /Trazas RAG/i }));

    expect(await screen.findByText("Consulta RAG")).toBeInTheDocument();
    expect(screen.getByText(/1200 ms/i)).toBeInTheDocument();
  });

  it("aplica búsqueda y muestra casos", async () => {
    const user = userEvent.setup();

    render(<AdminObservabilityPanel />);

    await screen.findByText("Necesito organizarme");
    await user.type(screen.getByPlaceholderText(/trace, pregunta/i), "apoyo");
    await user.click(screen.getByRole("button", { name: /Aplicar filtros/i }));

    await waitFor(() => {
      expect(mockedListAdminFeedback).toHaveBeenLastCalledWith(expect.objectContaining({ query: "apoyo" }));
    });

    await user.click(screen.getByRole("tab", { name: /Casos sensibles/i }));

    expect(await screen.findByText("Solicitó apoyo humano")).toBeInTheDocument();
    expect(screen.getByText(/case-1/i)).toBeInTheDocument();
  });
});
