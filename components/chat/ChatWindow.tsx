"use client";

import type { ChatMessage, FeedbackValue } from "@/lib/types";
import { ExamplePrompts } from "./ExamplePrompts";
import { MessageInput } from "./MessageInput";
import { MessageList } from "./MessageList";
import { TypingIndicator } from "./TypingIndicator";

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  onSubmitFeedback: (messageId: string, feedback: FeedbackValue) => void;
}

export function ChatWindow({
  messages,
  isLoading,
  error,
  onSendMessage,
  onSubmitFeedback,
}: ChatWindowProps) {
  return (
    <section className="flex min-h-[calc(100vh-150px)] flex-col rounded-2xl border border-border bg-white shadow-soft">
      <div className="border-b border-border px-5 py-5 sm:px-6">
        <h2 className="text-lg font-semibold text-foreground">Conversación</h2>
      </div>

      <div className="scrollbar-thin-soft flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <MessageList messages={messages} onSubmitFeedback={onSubmitFeedback} />
        <ExamplePrompts onSelectPrompt={onSendMessage} disabled={isLoading} />
        {isLoading ? <TypingIndicator /> : null}
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
