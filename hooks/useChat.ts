"use client";

import { useCallback, useMemo, useState } from "react";
import { sendFeedback as sendFeedbackToRag } from "@/lib/feedbackClient";
import { sendMessage as sendMessageToRag } from "@/lib/ragClient";
import type { ChatMessage, FeedbackValue, Source } from "@/lib/types";

const initialMessages: ChatMessage[] = [
  {
    id: "lia-welcome",
    role: "assistant",
    isInitial: true,
    content:
      "Hola, soy LIA. Puedo ayudarte con orientación académica y bienestar estudiantil. ¿Qué te gustaría conversar?",
  },
];

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function updateAssistantFeedback(
  messages: ChatMessage[],
  messageId: string,
  feedback: Partial<NonNullable<ChatMessage["feedback"]>>,
) {
  return messages.map((message) => {
    if (message.id !== messageId || message.role !== "assistant") {
      return message;
    }

    return {
      ...message,
      feedback: {
        value: message.feedback?.value ?? null,
        status: message.feedback?.status ?? "idle",
        ...feedback,
      },
    };
  });
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const latestSources = useMemo<Source[]>(() => {
    const lastAssistantWithSources = [...messages]
      .reverse()
      .find((message) => message.role === "assistant" && message.sources?.length);

    return lastAssistantWithSources?.sources ?? [];
  }, [messages]);

  const sendMessage = useCallback(
    async (message: string) => {
      const trimmedMessage = message.trim();

      if (!trimmedMessage || isLoading) {
        return;
      }

      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: "user",
        content: trimmedMessage,
      };

      setMessages((currentMessages) => [...currentMessages, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const ragResponse = await sendMessageToRag(trimmedMessage);

        const assistantMessage: ChatMessage = {
          id: createMessageId(),
          role: "assistant",
          content: ragResponse.response,
          sources: ragResponse.sources,
          traceId: ragResponse.traceId,
          caseId: ragResponse.caseId,
          feedback: {
            value: null,
            status: "idle",
          },
        };

        setMessages((currentMessages) => [...currentMessages, assistantMessage]);
      } catch (unknownError) {
        const errorMessage =
          unknownError instanceof Error
            ? unknownError.message
            : "No pudimos conectar con el RAG. Revisa el backend o intenta nuevamente.";

        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const submitFeedback = useCallback(
    async (messageId: string, feedback: FeedbackValue) => {
      const targetMessage = messages.find((message) => message.id === messageId);
      const traceId = targetMessage?.traceId;

      setMessages((currentMessages) =>
        updateAssistantFeedback(currentMessages, messageId, {
          value: feedback,
          status: "sending",
          error: undefined,
        }),
      );

      if (!traceId) {
        setMessages((currentMessages) =>
          updateAssistantFeedback(currentMessages, messageId, {
            value: feedback,
            status: "error",
            error: "No se encontró la traza de esta respuesta.",
          }),
        );
        return;
      }

      try {
        const feedbackResponse = await sendFeedbackToRag({
          traceId,
          feedback,
          source: "chatbot-lia",
        });

        setMessages((currentMessages) =>
          updateAssistantFeedback(currentMessages, messageId, {
            value: feedback,
            status: "sent",
            error: undefined,
            caseId: feedbackResponse.caseId,
          }),
        );
      } catch (unknownError) {
        const errorMessage =
          unknownError instanceof Error
            ? unknownError.message
            : "No pudimos registrar el feedback. Intenta nuevamente.";

        setMessages((currentMessages) =>
          updateAssistantFeedback(currentMessages, messageId, {
            value: feedback,
            status: "error",
            error: errorMessage,
          }),
        );
      }
    },
    [messages],
  );

  return {
    messages,
    latestSources,
    isLoading,
    error,
    sendMessage,
    submitFeedback,
  };
}
