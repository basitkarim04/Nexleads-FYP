export type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'spam' | 'trash';
export type EmailType = 'sent' | 'received' | 'draft';

export interface Email {
  _id: string;
  userId: string;
  leadId?: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  attachments?: string[];
  type: EmailType;
  folder: EmailFolder;
  isOpened: boolean;
  isRead: boolean;
  messageId?: string;
  threadId?: string;
  inReplyTo?: string;
  sentAt: string;
  createdAt?: string;
}

export interface ComposeEmailRequest {
  to: string;
  subject: string;
  body: string;
  leadId?: string;
  attachments?: File[];
}

export interface BulkEmailRequest {
  leadIds: string[];
  subject: string;
  body: string;
}

export interface DraftEmailRequest {
  to?: string;
  subject?: string;
  body?: string;
  leadId?: string;
}

export interface MoveEmailRequest {
  folder: EmailFolder;
}

export interface AiAssistRequest {
  mode: 'generate' | 'rewrite';
  prompt: string;
  existingContent?: string;
  leadContext?: string;
}

// The backend (/user/ai-assist) returns the GPT result as { subject?, body }
// — `body` is HTML. There is no `content` field; reading one yields undefined.
export interface AiAssistResponse {
  subject?: string;
  body: string;
}
