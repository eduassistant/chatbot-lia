import { sendMessage } from "../ragClient";

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
          traceId: "trace-123",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await sendMessage(" Necesito ayuda para organizarme ");

    expect(mockedFetch).toHaveBeenCalledWith(
      "/api/chat",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Necesito ayuda para organizarme" }),
      }),
    );
    expect(result.response).toBe("Respuesta del RAG");
    expect(result.sources).toHaveLength(1);
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
