import { fetchConversationHistory, sendMessage } from "../ragClient";

const mockedFetch = jest.fn();

describe("ragClient", () => {
  beforeEach(() => {
    mockedFetch.mockReset();
    global.fetch = mockedFetch as unknown as typeof fetch;
  });

  it("envía el mensaje al endpoint interno y devuelve la respuesta", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          response: "Respuesta del RAG",
          sources: [
            {
              documentId: 1,
              chunkId: 10,
              chunkIndex: 0,
              title: "Guía de bienestar estudiantil",
              fragment: "Fragmento relevante",
              score: 0.12,
            },
          ],
          conversationId: "550e8400-e29b-41d4-a716-446655440000",
          traceId: "trace-123",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await sendMessage(
      " Necesito ayuda para organizarme ",
      "550e8400-e29b-41d4-a716-446655440000",
    );

    expect(mockedFetch).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Necesito ayuda para organizarme",
          conversationId: "550e8400-e29b-41d4-a716-446655440000",
        }),
      }),
    );
    expect(result.response).toBe("Respuesta del RAG");
    expect(result.sources).toHaveLength(1);
    expect(result.conversationId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(result.traceId).toBe("trace-123");
  });

  it("lanza un error tipado cuando el endpoint interno responde con error", async () => {
    mockedFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: "No pudimos conectar con el backend RAG." }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(sendMessage("Hola")).rejects.toMatchObject({
      name: "RagClientError",
      message: "No pudimos conectar con el backend RAG.",
      status: 503,
    });
  });
});


  it("recupera historial conversacional desde el endpoint interno", async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          conversationId: "550e8400-e29b-41d4-a716-446655440000",
          status: "active",
          messageCount: 2,
          messages: [
            {
              id: 1,
              role: "user",
              content: "Hola",
              sources: [],
              createdAt: "2026-06-22T06:20:00Z",
            },
          ],
          message: "Conversación encontrada.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const history = await fetchConversationHistory("550e8400-e29b-41d4-a716-446655440000");

    expect(mockedFetch).toHaveBeenCalledWith(
      "/api/conversations/550e8400-e29b-41d4-a716-446655440000",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(history?.conversationId).toBe("550e8400-e29b-41d4-a716-446655440000");
    expect(history?.messages).toHaveLength(1);
  });
