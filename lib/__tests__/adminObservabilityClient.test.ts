import {
  AdminObservabilityClientError,
  listAdminCases,
  listAdminFeedback,
  listAdminRagTraces,
} from "../adminObservabilityClient";

const mockedFetch = jest.fn();

describe("adminObservabilityClient", () => {
  const previousFetch = global.fetch;

  beforeEach(() => {
    mockedFetch.mockReset();
    global.fetch = mockedFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = previousFetch;
  });

  it("lista feedback con filtros", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: 1,
              traceId: "trace-1",
              feedback: "useful",
              comment: null,
              source: "chatbot-lia",
              userIdentifier: null,
              question: "Pregunta",
              responsePreview: "Respuesta",
              metadata: {},
              createdAt: "2026-06-12T10:19:06.637912Z",
            },
          ],
          total: 1,
          page: 1,
          pageSize: 10,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await listAdminFeedback({ page: 1, pageSize: 10, feedback: "useful", query: "Pregunta" });

    expect(mockedFetch).toHaveBeenCalledWith(
      "/api/admin/feedback?page=1&page_size=10&query=Pregunta&feedback=useful",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(result.items[0].traceId).toBe("trace-1");
  });

  it("lista trazas RAG", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              id: 10,
              traceId: "trace-rag",
              status: "success",
              question: "Pregunta",
              responsePreview: "Respuesta",
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
              sources: [],
              safety: {},
              metadata: {},
              createdAt: "2026-06-30T10:07:09.926642Z",
            },
          ],
          total: 1,
          page: 1,
          pageSize: 10,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await listAdminRagTraces({ riskLevel: "medium" });

    expect(result.items[0].durationMs).toBe(1200);
    expect(mockedFetch).toHaveBeenCalledWith(
      "/api/admin/rag-traces?page=1&page_size=10&risk_level=medium",
      expect.any(Object),
    );
  });

  it("lista casos sensibles", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
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
              reason: "Motivo",
              resolutionNote: null,
              safety: {},
              metadata: {},
              createdAt: "2026-06-15T10:11:27.132519Z",
              updatedAt: "2026-06-15T10:11:27.132522Z",
            },
          ],
          total: 1,
          page: 1,
          pageSize: 10,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await listAdminCases({ status: "open" });

    expect(result.items[0].caseId).toBe("case-1");
  });

  it("propaga errores de API", async () => {
    mockedFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: "Admin role required" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(listAdminFeedback()).rejects.toThrow(AdminObservabilityClientError);
  });
});
