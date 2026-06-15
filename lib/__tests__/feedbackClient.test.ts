import { sendFeedback } from "../feedbackClient";

const mockedFetch = jest.fn();

describe("feedbackClient", () => {
  beforeEach(() => {
    mockedFetch.mockReset();
    global.fetch = mockedFetch as unknown as typeof fetch;
  });

  it("envía feedback al endpoint interno y devuelve la respuesta", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 1,
          traceId: "trace-123",
          feedback: "useful",
          message: "Feedback registrado correctamente.",
          caseId: "case-123",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await sendFeedback({
      traceId: " trace-123 ",
      feedback: "useful",
      source: "chatbot-lia",
    });

    expect(mockedFetch).toHaveBeenCalledWith(
      "/api/feedback",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          traceId: "trace-123",
          feedback: "useful",
          source: "chatbot-lia",
        }),
      }),
    );
    expect(result.traceId).toBe("trace-123");
    expect(result.feedback).toBe("useful");
    expect(result.caseId).toBe("case-123");
  });

  it("lanza un error tipado cuando el endpoint interno responde con error", async () => {
    mockedFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: "No se encontró la traza." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(sendFeedback({ traceId: "trace-123", feedback: "useful" })).rejects.toMatchObject({
      name: "FeedbackClientError",
      message: "No se encontró la traza.",
      status: 400,
    });
  });
});
