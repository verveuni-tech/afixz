/**
 * Flying Mali subscription plans — static data.
 * Also seeded to Firestore `subscriptionPlans` collection.
 */

export type BillingCycle = "monthly" | "6months" | "yearly";

export interface SubscriptionPlan {
  id: string;
  name: string;
  billingCycle: BillingCycle;
  price: number;          // total price for the cycle
  pricePerMonth: number;  // effective monthly price
  durationMonths: number;
  visitsPerMonth: number;
  plantCoverage: number;  // max plants included
  extraPlantRate: number; // ₹ per extra plant per month
  savings: number;        // savings vs monthly
  features: string[];
  highlight?: string;     // badge text for recommended plan
  active: boolean;
}

export const FLYING_MALI_FEATURES = [
  "Deep pruning & trimming",
  "Soil aeration & care",
  "Plant health monitoring",
  "Fertilizer & compost application",
  "Garden cleaning & waste removal",
  "Pest monitoring & disease treatment",
  "Priority booking",
  "Emergency visit support",
  "Seasonal planting guidance",
];

export const FLYING_MALI_NOTES = [
  "Extra plants beyond 30: ₹10/plant/month",
  "Pots, plants & fertilizers are NOT included",
  "7-day plant guarantee for damage/disease",
  "Cancel anytime — no lock-in",
  "Payment: Cash on Delivery per visit",
];

export const FLYING_MALI_PLANS: SubscriptionPlan[] = [
  {
    id: "flying-mali-monthly",
    name: "Monthly",
    billingCycle: "monthly",
    price: 499,
    pricePerMonth: 499,
    durationMonths: 1,
    visitsPerMonth: 2,
    plantCoverage: 30,
    extraPlantRate: 10,
    savings: 0,
    features: FLYING_MALI_FEATURES,
    active: true,
  },
  {
    id: "flying-mali-6months",
    name: "6 Months",
    billingCycle: "6months",
    price: 2695,
    pricePerMonth: 449,
    durationMonths: 6,
    visitsPerMonth: 2,
    plantCoverage: 30,
    extraPlantRate: 10,
    savings: 299,
    features: FLYING_MALI_FEATURES,
    highlight: "Most Popular",
    active: true,
  },
  {
    id: "flying-mali-yearly",
    name: "Yearly",
    billingCycle: "yearly",
    price: 5390,
    pricePerMonth: 449,
    durationMonths: 12,
    visitsPerMonth: 2,
    plantCoverage: 30,
    extraPlantRate: 10,
    savings: 598,
    features: [
      ...FLYING_MALI_FEATURES,
      "1 month free equivalent",
      "Priority support",
    ],
    highlight: "Best Value",
    active: true,
  },
];

export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  monthly: "Monthly",
  "6months": "6 Months",
  yearly: "Yearly",
};
