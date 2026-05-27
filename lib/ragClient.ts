import type { Source } from "./types";

export interface ChatResponse {
  response: string;
  sources: Source[];
}

export async function sendMessage(message: string): Promise<ChatResponse> {
  // Esta primera feature usa respuesta simulada para validar la UI.
  // La integración real con rag-lia se conectará en la siguiente issue.
  await new Promise((resolve) => setTimeout(resolve, 650));

  return {
    response:
      "Entiendo que te sientas así. Cuando las obligaciones se acumulan, puede ayudar dividir lo urgente de lo importante y pedir apoyo antes de que la situación avance. Podemos empezar por ordenar tus materias, fechas clave y el primer paso más pequeño para hoy.",
    sources: [
      {
        documentId: 1,
        chunkId: 10,
        chunkIndex: 0,
        title: "Guía de bienestar estudiantil",
        fragment:
          "Ante situaciones de estrés académico, se recomienda solicitar orientación temprana y organizar prioridades.",
        score: 0.12,
      },
      {
        documentId: 2,
        chunkId: 18,
        chunkIndex: 1,
        title: "Recursos de permanencia académica",
        fragment:
          "Los estudiantes pueden acceder a espacios de acompañamiento para revisar dificultades de cursado.",
        score: 0.18,
      },
    ],
  };
}
