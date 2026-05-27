export type ChatRole = "user" | "assistant";

export type FeedbackValue = "useful" | "insufficient" | "human_help";

export interface Source {
  documentId: number;
  chunkId: number;
  chunkIndex: number;
  title: string;
  fragment: string;
  score: number;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  sources?: Source[];
  isInitial?: boolean;
}
