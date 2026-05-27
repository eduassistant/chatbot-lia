"use client";

import { FormEvent, useState } from "react";

interface MessageInputProps {
  disabled?: boolean;
  onSendMessage: (message: string) => void;
}

export function MessageInput({ disabled = false, onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();
    if (!trimmedMessage || disabled) {
      return;
    }

    onSendMessage(trimmedMessage);
    setMessage("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <label htmlFor="chat-message" className="sr-only">
        Escribe tu mensaje
      </label>
      <input
        id="chat-message"
        type="text"
        value={message}
        disabled={disabled}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="Escribe tu mensaje..."
        className="min-w-0 flex-1 rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted sm:text-base"
      />
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6"
      >
        <span aria-hidden="true">➤</span>
        <span className="hidden sm:inline">Enviar</span>
      </button>
    </form>
  );
}
