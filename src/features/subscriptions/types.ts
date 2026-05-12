import type { BillingCycle } from "./plans";

export type SubscriptionStatus = "active" | "paused" | "cancelled" | "expired";

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
  planId: string;            // e.g. "flying-mali-monthly"
  planName: string;          // e.g. "Monthly"
  billingCycle: BillingCycle;
  price: number;             // total price for cycle
  pricePerMonth: number;
  durationMonths: number;
  visitsPerMonth: number;
  plantCoverage: number;
  locationId: string;
  address: SubscriptionAddress;
  preferredTime: string;
  status: SubscriptionStatus;
  startDate: string;         // YYYY-MM-DD
  endDate: string;           // YYYY-MM-DD
  nextVisitDate: string;     // YYYY-MM-DD
  createdAt: any;
  customerName: string;
  customerPhone: string;
}

export const TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"];
