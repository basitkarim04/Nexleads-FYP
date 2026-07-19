export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'responded'
  | 'in_discussion'
  | 'ongoing'
  | 'completed'
  | 'rejected';

export type LeadInterest = 'interested' | 'not_interested';

export type LeadPlatform =
  | 'upwork'
  | 'linkedin'
  | 'freelancer'
  | 'fiverr'
  | 'other';

export interface Lead {
  _id: string;
  userId: string;
  name: string;
  company: string;
  email: string;
  platform: LeadPlatform | string;
  jobField: string;
  sourceUrl?: string;
  status: LeadStatus;
  interest?: LeadInterest;
  emailsSent: number;
  responsesReceived: number;
  lastContactedAt?: string;
  createdAt: string;
  jobTitle?: string;
  notes?: string;
}

export interface LeadSearchParams {
  keyword?: string;
  platforms?: string;
  startDate?: string;
  endDate?: string;
  status?: LeadStatus;
  page?: number;
  limit?: number;
}

export interface SaveLeadRequest {
  name: string;
  company: string;
  email: string;
  platform: string;
  sourceUrl?: string;
  jobTitle?: string;
}

export interface UpdateLeadStatusRequest {
  status: LeadStatus;
}

export interface UpdateLeadInterestRequest {
  interest: LeadInterest;
}
