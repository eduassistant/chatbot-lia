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

export type DocumentUploadStatus = "idle" | "uploading" | "success" | "error";

export interface DocumentUploadResponse {
  documentId: number;
  title: string;
  filename: string;
  contentType?: string | null;
  extension: string;
  chunksCount: number;
  status: "indexed";
  message: string;
}

export interface RagDocumentUploadResponse {
  document_id: number;
  title: string;
  filename: string;
  content_type?: string | null;
  extension: string;
  chunks_count: number;
  status: "indexed";
  message: string;
}
export type DocumentLibraryStatus = "indexed" | "empty";

export type DocumentLibraryExtension = "txt" | "md" | "pdf" | "docx";

export interface DocumentLibraryItem {
  documentId: number;
  title: string;
  source: string;
  filename?: string | null;
  extension?: string | null;
  status: DocumentLibraryStatus;
  chunksCount: number;
  contentChars: number;
  createdAt: string;
}

export interface DocumentLibraryListResponse {
  items: DocumentLibraryItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface DocumentChunkPreview {
  chunkId: number;
  chunkIndex: number;
  contentPreview: string;
  createdAt: string;
}

export interface DocumentLibraryDetail extends DocumentLibraryItem {
  contentPreview: string;
  chunks: DocumentChunkPreview[];
}

export interface DocumentReindexResponse {
  documentId: number;
  title: string;
  source: string;
  status: DocumentLibraryStatus;
  chunksCount: number;
  message: string;
}

export interface DocumentLibraryFilters {
  query?: string;
  status?: DocumentLibraryStatus | "";
  extension?: DocumentLibraryExtension | "";
  limit?: number;
  offset?: number;
}

export interface RagDocumentLibraryItem {
  document_id: number;
  title: string;
  source: string;
  filename?: string | null;
  extension?: string | null;
  status: DocumentLibraryStatus;
  chunks_count: number;
  content_chars: number;
  created_at: string;
}

export interface RagDocumentLibraryListResponse {
  items: RagDocumentLibraryItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface RagDocumentChunkPreview {
  chunk_id: number;
  chunk_index: number;
  content_preview: string;
  created_at: string;
}

export interface RagDocumentLibraryDetail extends RagDocumentLibraryItem {
  content_preview: string;
  chunks: RagDocumentChunkPreview[];
}

export interface RagDocumentReindexResponse {
  document_id: number;
  title: string;
  source: string;
  status: DocumentLibraryStatus;
  chunks_count: number;
  message: string;
}

