export type PlanName = 'free' | 'pro' | 'platinum';
// UI-facing billing cycle (what the toggle/state uses).
export type BillingCycle = 'monthly' | 'annual';
// Wire format the backend expects on POST /user/payment-intent and
// /user/subscription. It compares against the literal 'annually' (not 'annual').
export type ApiBillingCycle = 'monthly' | 'annually';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

// Shape returned by GET /user/plans. Free has a flat `price: 0` and no
// monthly/annual fields; paid plans have monthlyPrice/annualPrice instead.
export interface Plan {
  id: PlanName;
  name: string; // display name, e.g. "Free" / "Pro" / "Platinum"
  price?: number;
  monthlyPrice?: number;
  annualPrice?: number;
  leadsLimit: number; // -1 means unlimited
  features: string[];
}

export interface SubscriptionRecord {
  _id: string;
  userId: string;
  plan: PlanName;
  price: number;
  paymentMethod: string;
  transactionId: string;
  billingCycle: ApiBillingCycle;
  startDate: string;
  endDate: string;
  status: SubscriptionStatus;
  cancelledAt?: string;
  stripeSubscriptionId?: string | null;
}

export interface CreateSubscriptionRequest {
  plan: PlanName;
  billingCycle: ApiBillingCycle;
  paymentIntentId: string;
}

export interface PaymentIntentRequest {
  plan: PlanName;
  billingCycle: ApiBillingCycle;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  // The backend returns the Stripe PaymentIntent id alongside the client secret.
  // We must keep this and pass it back to POST /user/subscription so the backend
  // can verify the payment and actually update the user's plan in the database.
  paymentIntentId: string;
}
