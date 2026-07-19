import { Lead } from './lead.types';

export type ProjectStatus = 'in_discussion' | 'ongoing' | 'completed';

export interface Project {
  _id: string;
  userId: string;
  leadId: Lead | string;
  title: string;
  company: string;
  description?: string;
  budget?: number;
  deadline?: string;
  status: ProjectStatus;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface CreateProjectRequest {
  leadId: string;
  title: string;
  company: string;
  description?: string;
  budget?: number;
  deadline?: string;
}

export interface UpdateProjectRequest {
  title?: string;
  company?: string;
  description?: string;
  budget?: number;
  deadline?: string;
}

export interface UpdateProjectStatusRequest {
  status: ProjectStatus;
}
