"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { sendFeedback as sendFeedbackToRag } from "@/lib/feedbackClient";
import {
  fetchConversationHistory,
  sendMessage as sendMessageToRag,
} from "@/lib/ragClient";
import {
  getOrCreateConversationId,
  persistConversationId,
  resetStoredConversationId,
} from "@/lib/conversationSession";
import type { ChatMessage, ConversationHistoryResponse, FeedbackValue, Source } from "@/lib/types";

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

function buildMessagesFromHistory(history: ConversationHistoryResponse): ChatMessage[] {
  if (!history.messages.length) {
    return initialMessages;
  }

  return [
    ...initialMessages,
    ...history.messages.map<ChatMessage>((message) => ({
      id: `history-${message.id}`,
      role: message.role,
      content: message.content,
      sources: message.sources,
      traceId: message.traceId,
      caseId: message.caseId,
      createdAt: message.createdAt,
      feedback:
        message.role === "assistant"
          ? {
              value: null,
              status: "idle",
            }
          : undefined,
    })),
  ];
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
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadConversationHistory() {
      const nextConversationId = getOrCreateConversationId();
      setConversationId(nextConversationId);
      setIsHistoryLoading(true);

      try {
        const history = await fetchConversationHistory(nextConversationId);

        if (!isMounted) {
          return;
        }

        if (history) {
          setMessages(buildMessagesFromHistory(history));
        }
      } catch (unknownError) {
        if (!isMounted) {
          return;
        }

        const errorMessage =
          unknownError instanceof Error
            ? unknownError.message
            : "No pudimos recuperar el historial conversacional.";

        setError(errorMessage);
      } finally {
        if (isMounted) {
          setIsHistoryLoading(false);
        }
      }
    }

    void loadConversationHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const latestSources = useMemo<Source[]>(() => {
    const lastAssistantWithSources = [...messages]
      .reverse()
      .find((message) => message.role === "assistant" && message.sources?.length);

    return lastAssistantWithSources?.sources ?? [];
  }, [messages]);

  const sendMessage = useCallback(
    async (message: string) => {
      const trimmedMessage = message.trim();

      if (!trimmedMessage || isLoading || isHistoryLoading) {
        return;
      }

      const activeConversationId = conversationId ?? getOrCreateConversationId();
      setConversationId(activeConversationId);

      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: "user",
        content: trimmedMessage,
      };

      setMessages((currentMessages) => [...currentMessages, userMessage]);
      setIsLoading(true);
      setError(null);

      try {
        const ragResponse = await sendMessageToRag(trimmedMessage, activeConversationId);

        if (ragResponse.conversationId) {
          persistConversationId(ragResponse.conversationId);
          setConversationId(ragResponse.conversationId);
        }

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
    [conversationId, isHistoryLoading, isLoading],
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

  const startNewConversation = useCallback(() => {
    const nextConversationId = resetStoredConversationId();
    setConversationId(nextConversationId);
    setMessages(initialMessages);
    setError(null);
  }, []);

  return {
    conversationId,
    messages,
    latestSources,
    isLoading,
    isHistoryLoading,
    error,
    sendMessage,
    submitFeedback,
    startNewConversation,
  };
}
