import type { ChatMessage, FeedbackValue } from "@/lib/types";
import { FeedbackButtons } from "@/components/feedback/FeedbackButtons";

interface MessageBubbleProps {
  message: ChatMessage;
  onSubmitFeedback: (messageId: string, feedback: FeedbackValue) => void;
}

export function MessageBubble({ message, onSubmitFeedback }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const feedback = message.feedback ?? { value: null, status: "idle" as const };

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
            <FeedbackButtons
              selectedFeedback={feedback.value}
              status={feedback.status}
              error={feedback.error}
              disabled={!message.traceId}
              onSubmitFeedback={(feedbackValue) => onSubmitFeedback(message.id, feedbackValue)}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}
