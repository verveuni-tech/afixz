import {
  collection,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import type { Subscription, SubscriptionAddress, SubscriptionStatus } from "./types";
import type { SubscriptionPlan } from "./plans";
import { GARDEN_CARE_PLANS } from "./plans";

/* ─── Date helpers ─────────────────────────────────────── */

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split("T")[0];
}

/**
 * Evenly space visit dates across the subscription period.
 * interval = floor(30 / visitsPerMonth) days
 * e.g. 2 visits/month → every 15 days
 *      3 visits/month → every 10 days
 * First visit = startDate.
 */
function buildVisitDates(
  startDate: string,
  visitsPerMonth: number,
  durationMonths: number
): string[] {
  const intervalDays = Math.floor(30 / visitsPerMonth);
  const totalVisits = visitsPerMonth * durationMonths;
  return Array.from({ length: totalVisits }, (_, i) =>
    addDays(startDate, i * intervalDays)
  );
}

/* ─── Subscription creation (atomic) ───────────────────── */

/**
 * Creates subscription + all pre-scheduled visit bookings in a single
 * Firestore batch. Atomic: if any write fails, nothing is committed.
 *
 * Visit bookings are created as `status: "pending"` so providers can
 * immediately see and claim upcoming dates.
 */
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
  const visitDates = buildVisitDates(startDate, plan.visitsPerMonth, plan.durationMonths);
  const totalVisits = visitDates.length;

  const batch = writeBatch(db);

  // ── 1. Subscription document ────────────────────────────
  const subRef = doc(collection(db, "subscriptions"));
  batch.set(subRef, {
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
    nextVisitDate: visitDates[0],  // first scheduled visit
    totalVisits,
    completedVisits: 0,
    customerName: address.name,
    customerPhone: address.phone,
    createdAt: serverTimestamp(),
  });

  // ── 2. One booking per visit date ───────────────────────
  //    All created upfront as "pending" so providers can see & claim them.
  //    Firestore rule: validSubscriptionBooking allows this path.
  for (let i = 0; i < visitDates.length; i++) {
    const bookingRef = doc(collection(db, "bookings"));
    batch.set(bookingRef, {
      userId,
      serviceId: "garden-care",
      serviceSlug: "garden-care",
      serviceTitle: `Garden Care — ${plan.name}`,
      price: plan.pricePerMonth,
      totalPrice: plan.pricePerMonth,
      locationId,
      address,
      scheduledDate: visitDates[i],
      scheduledTime: preferredTime,
      paymentMode: "cod",
      status: "pending",
      source: "subscription",
      subscriptionId: subRef.id,
      visitNumber: i + 1,
      totalVisits,
      customerName: address.name,
      customerPhone: address.phone,
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
  return subRef.id;
}

/* ─── Status update with visit cascade ─────────────────── */

/**
 * Updates subscription status and cascades to visit bookings:
 *
 * paused    → pending visits → "on-hold"   (hidden from providers)
 * active    → on-hold visits → "pending"   (re-exposed to providers)
 * cancelled → pending + on-hold → "cancelled"
 * expired   → pending + on-hold → "cancelled"
 */
export async function updateSubscriptionStatus(
  id: string,
  status: SubscriptionStatus
): Promise<void> {
  const batch = writeBatch(db);

  // Update subscription doc
  batch.update(doc(db, "subscriptions", id), { status });

  // Cascade to visit bookings
  if (status === "cancelled" || status === "expired") {
    // Cancel all future visits (pending + on-hold)
    const q = query(
      collection(db, "bookings"),
      where("subscriptionId", "==", id),
      where("status", "in", ["pending", "on-hold"])
    );
    const snap = await getDocs(q);
    snap.docs.forEach((d) => batch.update(d.ref, { status: "cancelled" }));

  } else if (status === "paused") {
    // Hide future visits from providers
    const q = query(
      collection(db, "bookings"),
      where("subscriptionId", "==", id),
      where("status", "==", "pending")
    );
    const snap = await getDocs(q);
    snap.docs.forEach((d) => batch.update(d.ref, { status: "on-hold" }));

  } else if (status === "active") {
    // Resume — restore on-hold visits to pending
    const q = query(
      collection(db, "bookings"),
      where("subscriptionId", "==", id),
      where("status", "==", "on-hold")
    );
    const snap = await getDocs(q);
    snap.docs.forEach((d) => batch.update(d.ref, { status: "pending" }));
  }

  await batch.commit();
}

/* ─── Read helpers ──────────────────────────────────────── */

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

/* ─── Plan CRUD (Firestore) ─────────────────────────────── */

export async function seedPlansToFirestore(): Promise<void> {
  for (const plan of GARDEN_CARE_PLANS) {
    await setDoc(doc(db, "subscriptionPlans", plan.id), plan);
  }
}

export async function getPlansFromFirestore(): Promise<SubscriptionPlan[]> {
  const snap = await getDocs(collection(db, "subscriptionPlans"));
  if (snap.empty) return GARDEN_CARE_PLANS; // fallback to static
  return snap.docs
    .map((d) => d.data() as SubscriptionPlan)
    .filter((p) => p.active)
    .sort((a, b) => a.durationMonths - b.durationMonths);
}

export async function updatePlanInFirestore(
  planId: string,
  updates: Partial<SubscriptionPlan>
): Promise<void> {
  await updateDoc(doc(db, "subscriptionPlans", planId), updates);
}
