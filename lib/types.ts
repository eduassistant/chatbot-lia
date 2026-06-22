export type ChatRole = "user" | "assistant";

export type FeedbackValue = "useful" | "insufficient" | "needs_human_support";

export type FeedbackStatus = "idle" | "sending" | "sent" | "error";

export interface FeedbackState {
  value: FeedbackValue | null;
  status: FeedbackStatus;
  error?: string;
  caseId?: string;
}

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
  traceId?: string;
  caseId?: string;
  isInitial?: boolean;
  feedback?: FeedbackState;
  createdAt?: string;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
}

export interface ChatResponse {
  response: string;
  sources: Source[];
  conversationId?: string;
  traceId?: string;
  caseId?: string;
}

export interface FeedbackRequest {
  traceId: string;
  feedback: FeedbackValue;
  comment?: string;
  source?: string;
}

export interface FeedbackResponse {
  id: number;
  traceId: string;
  feedback: FeedbackValue;
  message: string;
  caseId?: string;
}

export interface ConversationMessage {
  id: number;
  role: ChatRole;
  content: string;
  traceId?: string;
  caseId?: string;
  sources: Source[];
  createdAt: string;
}

export interface ConversationHistoryResponse {
  conversationId: string;
  status: "active" | "expired";
  messageCount: number;
  messages: ConversationMessage[];
  expiresAt?: string;
  message: string;
}

export interface RagSource {
  document_id: number;
  chunk_id: number;
  chunk_index: number;
  distance: number;
  relevance_score?: number;
  title?: string;
  document_title?: string;
  fragment?: string;
  content?: string;
  score?: number;
}

export interface RagChatResponse {
  response: string;
  sources?: RagSource[];
  conversation_id?: string | null;
  trace_id?: string;
  case_id?: string | null;
}

export interface RagFeedbackResponse {
  id: number;
  trace_id: string;
  feedback: FeedbackValue;
  message: string;
  case_id?: string | null;
}

export interface RagConversationMessage {
  id: number;
  role: ChatRole;
  content: string;
  trace_id?: string | null;
  case_id?: string | null;
  sources?: RagSource[];
  safety?: Record<string, unknown>;
  created_at: string;
}

export interface RagConversationResponse {
  conversation_id: string;
  status: "active" | "expired";
  message_count: number;
  messages: RagConversationMessage[];
  expires_at?: string | null;
  message: string;
}
