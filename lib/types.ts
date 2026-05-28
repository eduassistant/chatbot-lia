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

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  sources: Source[];
}

export interface RagSource {
  document_id: number;
  chunk_id: number;
  chunk_index: number;
  distance: number;
  title?: string;
  document_title?: string;
  fragment?: string;
  content?: string;
  score?: number;
}

export interface RagChatResponse {
  response: string;
  sources?: RagSource[];
}
