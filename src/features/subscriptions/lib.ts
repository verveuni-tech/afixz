import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";
import type { Subscription, SubscriptionAddress, SubscriptionStatus } from "./types";
import type { SubscriptionPlan } from "./plans";

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

/** Next visit = 15 days from start (2 visits/month ≈ every 15 days) */
function getNextVisitDate(startDate: string): string {
  return addDays(startDate, 15);
}

export async function createPlanSubscription(params: {
  userId: string;
  plan: SubscriptionPlan;
  locationId: string;
  address: SubscriptionAddress;
  preferredTime: string;
  startDate: string;
}): Promise<string> {
  const { userId, plan, locationId, address, preferredTime, startDate } = params;

  const endDate = addMonths(startDate, plan.durationMonths);
  const nextVisitDate = getNextVisitDate(startDate);

  const ref = await addDoc(collection(db, "subscriptions"), {
    userId,
    planId: plan.id,
    planName: plan.name,
    billingCycle: plan.billingCycle,
    price: plan.price,
    pricePerMonth: plan.pricePerMonth,
    durationMonths: plan.durationMonths,
    visitsPerMonth: plan.visitsPerMonth,
    plantCoverage: plan.plantCoverage,
    locationId,
    address,
    preferredTime,
    status: "active" as SubscriptionStatus,
    startDate,
    endDate,
    nextVisitDate,
    customerName: address.name,
    customerPhone: address.phone,
    createdAt: serverTimestamp(),
  });

  return ref.id;
}

export async function updateSubscriptionStatus(
  id: string,
  status: SubscriptionStatus
): Promise<void> {
  await updateDoc(doc(db, "subscriptions", id), { status });
}

export async function getUserSubscriptions(userId: string): Promise<Subscription[]> {
  const q = query(
    collection(db, "subscriptions"),
    where("userId", "==", userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subscription));
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const snap = await getDocs(collection(db, "subscriptions"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Subscription));
}
