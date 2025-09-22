export interface CurrentSubscription {
  _id: string;
  userId: string;
  plan?: "Starter" | "Medium" | "Pro";
  isSubscriptionActive: boolean;
  trialExpiresAt?: string;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  isTrial?: boolean;
}