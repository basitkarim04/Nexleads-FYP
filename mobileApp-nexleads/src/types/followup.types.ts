export interface FollowUp {
  _id: string;
  userId: string;
  jobField: string;
  platform: string;
  totalLeadsSent: number;
  followUpsSent: number;
  responsesReceived: number;
  lastFollowUpDate?: string;
  createdAt: string;
}

export interface FollowUpStats {
  totalFollowUpsSent: number;
  responsesReceived: number;
  lastFollowUpDate?: string;
}

export interface CreateFollowUpRequest {
  jobField: string;
  platform: string;
}

export interface RecordFollowUpRequest {
  followUpId: string;
  leadIds: string[];
  subject: string;
  body: string;
}

export interface SendFollowUpRequest {
  subject: string;
  body: string;
  leadIds?: string[];
}

export interface UpdateFollowUpRequest {
  jobField?: string;
  platform?: string;
}
