"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage, FeedbackValue } from "@/lib/types";
import { MessageBubble } from "./MessageBubble";

interface MessageListProps {
  messages: ChatMessage[];
  onSubmitFeedback: (messageId: string, feedback: FeedbackValue) => void;
}

export function MessageList({ messages, onSubmitFeedback }: MessageListProps) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} onSubmitFeedback={onSubmitFeedback} />
      ))}
      <div ref={endRef} />
    </div>
  );
}
