"use client";

import { useChat } from "@/hooks/useChat";
import { DocumentLibraryPanel } from "@/components/documents/DocumentLibraryPanel";
import { DocumentUploadPanel } from "@/components/documents/DocumentUploadPanel";
import { SourcesPanel } from "@/components/sources/SourcesPanel";
import { ChatWindow } from "./ChatWindow";

export function ChatExperience() {
  const chat = useChat();

  return (
    <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:h-[calc(100vh-104px)] lg:grid-cols-[minmax(0,1fr)_360px] lg:overflow-hidden">
      <ChatWindow
        conversationId={chat.conversationId}
        messages={chat.messages}
        isLoading={chat.isLoading || chat.isHistoryLoading}
        isHistoryLoading={chat.isHistoryLoading}
        error={chat.error}
        onSendMessage={chat.sendMessage}
        onSubmitFeedback={chat.submitFeedback}
        onStartNewConversation={chat.startNewConversation}
      />
      <div className="space-y-6 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:pr-2">
        <DocumentUploadPanel />
        <DocumentLibraryPanel />
        <SourcesPanel sources={chat.latestSources} />
      </div>
    </section>
  );
}
