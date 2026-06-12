"use client";

import type { FeedbackStatus, FeedbackValue } from "@/lib/types";

const feedbackOptions: Array<{ value: FeedbackValue; label: string; icon: string }> = [
  { value: "useful", label: "Útil", icon: "👍" },
  { value: "insufficient", label: "Insuficiente", icon: "👎" },
  { value: "needs_human_support", label: "Necesito hablar con alguien", icon: "☎" },
];

interface FeedbackButtonsProps {
  selectedFeedback: FeedbackValue | null;
  status: FeedbackStatus;
  error?: string;
  disabled?: boolean;
  onSubmitFeedback: (feedback: FeedbackValue) => void;
}

function getStatusMessage(status: FeedbackStatus, error?: string) {
  if (status === "sending") {
    return "Enviando feedback...";
  }

  if (status === "sent") {
    return "Feedback enviado.";
  }

  if (status === "error") {
    return error || "No pudimos enviar el feedback.";
  }

  return null;
}

export function FeedbackButtons({
  selectedFeedback,
  status,
  error,
  disabled = false,
  onSubmitFeedback,
}: FeedbackButtonsProps) {
  const statusMessage = getStatusMessage(status, error);

  return (
    <div className="space-y-1.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {feedbackOptions.map((option) => {
          const isSelected = selectedFeedback === option.value;
          const isSending = status === "sending";

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSubmitFeedback(option.value)}
              disabled={disabled || isSending}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                isSelected
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              } ${disabled || isSending ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <span aria-hidden="true">{option.icon}</span>
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {statusMessage ? (
        <p className={`text-xs ${status === "error" ? "text-red-600" : "text-muted-foreground"}`}>
          {statusMessage}
        </p>
      ) : null}
    </div>
  );
}
