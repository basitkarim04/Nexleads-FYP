export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  nexleadsEmail: string;
  type: 'User' | 'Admin';
  bio?: string;
  profilePicture?: string;
  blocked: boolean;
  subscription: {
    plan: 'free' | 'pro' | 'platinum';
    billingCycle: "monthly" | "annually";
    leadsLimit: number;
    leadsUsed: number;
    resetDate: string;
    status?: 'active' | 'cancelled';
    stripeSubscriptionId?: string | null;
  };
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePersonalInfoRequest {
  name: string;
  bio?: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
  message?: string;
}
