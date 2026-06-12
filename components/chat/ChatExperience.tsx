"use client";

import { useChat } from "@/hooks/useChat";
import { SourcesPanel } from "@/components/sources/SourcesPanel";
import { ChatWindow } from "./ChatWindow";

export function ChatExperience() {
  const chat = useChat();

  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <ChatWindow
        messages={chat.messages}
        isLoading={chat.isLoading}
        error={chat.error}
        onSendMessage={chat.sendMessage}
        onSubmitFeedback={chat.submitFeedback}
      />
      <SourcesPanel sources={chat.latestSources} />
    </section>
  );
}
