export type SubscriptionFrequency = "weekly" | "biweekly" | "monthly";
export type SubscriptionStatus = "active" | "paused" | "cancelled";

export interface SubscriptionAddress {
  name: string;
  phone: string;
  houseNo: string;
  area: string;
  landmark?: string;
  city: string;
  pincode: string;
  fullAddress: string;
}

export interface Subscription {
  id: string;
  userId: string;
  serviceId: string;
  serviceTitle: string;
  serviceSlug: string;
  price: number;
  locationId: string;
  address: SubscriptionAddress;
  frequency: SubscriptionFrequency;
  preferredTime: string;
  status: SubscriptionStatus;
  nextScheduledDate: string; // YYYY-MM-DD
  createdAt: any;
  lastBookingId?: string;
  skippedDates?: string[];
}

export const FREQUENCY_LABELS: Record<SubscriptionFrequency, string> = {
  weekly: "Every week",
  biweekly: "Every 2 weeks",
  monthly: "Every month",
};

export const TIME_SLOTS = ["10:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"];
