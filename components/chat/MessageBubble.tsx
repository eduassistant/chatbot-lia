import type { ChatMessage } from "@/lib/types";
import { FeedbackButtons } from "@/components/feedback/FeedbackButtons";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <article className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[88%] sm:max-w-[78%]">
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:text-[15px] ${
            isUser
              ? "rounded-br-sm bg-primary text-primary-foreground"
              : "rounded-bl-sm border border-border bg-white text-foreground"
          }`}
        >
          {message.content}
        </div>

        {!isUser && !message.isInitial ? (
          <div className="mt-2">
            <FeedbackButtons />
          </div>
        ) : null}
      </div>
    </article>
  );
}
