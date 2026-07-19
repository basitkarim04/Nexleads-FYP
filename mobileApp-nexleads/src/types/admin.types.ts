import { UserProfile } from './auth.types';
import { SubscriptionRecord } from './subscription.types';

export interface AdminStats {
  totalUsers: number;
  totalLeads: number;
  totalEarnings: number;
  activeSubscriptions: number;
  newUsersThisMonth: number;
}

export interface AdminUser extends UserProfile {
  leadsCount: number;
  subscriptions?: SubscriptionRecord[];
}

export interface BlockUserRequest {
  blocked: boolean;
}
