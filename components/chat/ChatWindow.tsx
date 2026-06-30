"use client";

import type { ChatMessage, FeedbackValue } from "@/lib/types";
import { ExamplePrompts } from "./ExamplePrompts";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { TypingIndicator } from "./TypingIndicator";

interface ChatWindowProps {
  conversationId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isHistoryLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  onSubmitFeedback: (messageId: string, feedback: FeedbackValue) => void;
  onStartNewConversation: () => void;
}

function getShortConversationId(conversationId: string | null) {
  if (!conversationId) {
    return "generando sesión...";
  }

  return `${conversationId.slice(0, 8)}...${conversationId.slice(-4)}`;
}

export function ChatWindow({
  conversationId,
  messages,
  isLoading,
  isHistoryLoading,
  error,
  onSendMessage,
  onSubmitFeedback,
  onStartNewConversation,
}: ChatWindowProps) {
  return (
    <section className="flex min-h-[calc(100vh-150px)] flex-col rounded-2xl border border-border bg-white shadow-soft lg:h-full lg:min-h-0">
      <div className="border-b border-border px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Conversación</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Sesión anónima: {getShortConversationId(conversationId)}
            </p>
          </div>
          <button
            type="button"
            onClick={onStartNewConversation}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-xl border border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-secondary-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            Nueva conversación
          </button>
        </div>
      </div>

      <div className="scrollbar-thin-soft min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        {isHistoryLoading ? (
          <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
            Recuperando historial conversacional anónimo...
          </div>
        ) : null}
        <MessageList messages={messages} onSubmitFeedback={onSubmitFeedback} />
        <ExamplePrompts onSelectPrompt={onSendMessage} disabled={isLoading} />
        {isLoading && !isHistoryLoading ? <TypingIndicator /> : null}
        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </div>

      <div className="border-t border-border px-4 py-4 sm:px-5">
        <MessageInput onSendMessage={onSendMessage} disabled={isLoading} />
      </div>
    </section>
  );
}
