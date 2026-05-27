"use client";

import { useState } from "react";
import type { FeedbackValue } from "@/lib/types";

const feedbackOptions: Array<{ value: FeedbackValue; label: string; icon: string }> = [
  { value: "useful", label: "Útil", icon: "👍" },
  { value: "insufficient", label: "Insuficiente", icon: "👎" },
  { value: "human_help", label: "Necesito hablar con alguien", icon: "☎" },
];

export function FeedbackButtons() {
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackValue | null>(null);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      {feedbackOptions.map((option) => {
        const isSelected = selectedFeedback === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelectedFeedback(option.value)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
              isSelected
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
            }`}
          >
            <span aria-hidden="true">{option.icon}</span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
