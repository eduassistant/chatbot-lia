"use client";

import { useCallback, useMemo, useState } from "react";
import { sendMessage as sendMessageToRag } from "@/lib/ragClient";
import type { ChatMessage, Source } from "@/lib/types";

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

  const sendMessage = useCallback(async (message: string) => {
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
  }, [isLoading]);

  return {
    messages,
    latestSources,
    isLoading,
    error,
    sendMessage,
  };
}
