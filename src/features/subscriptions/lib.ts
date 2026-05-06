import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
  getDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  Subscription,
  SubscriptionAddress,
  SubscriptionFrequency,
  SubscriptionStatus,
} from "./types";
import { normalizeService, resolveServiceForLocation } from "../../lib/services";
import type { LocationId } from "../../lib/locations";

export function getNextDate(from: string, frequency: SubscriptionFrequency): string {
  const d = new Date(from);
  const days = frequency === "weekly" ? 7 : frequency === "biweekly" ? 14 : 30;
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split("T")[0];
}

export function isDue(dateStr: string): boolean {
  return dateStr <= new Date().toISOString().split("T")[0];
}

export async function createSubscription(params: {
  userId: string;
  serviceId: string;
  serviceTitle: string;
  serviceSlug: string;
  price: number;
  locationId: string;
  address: SubscriptionAddress;
  frequency: SubscriptionFrequency;
  preferredTime: string;
  startDate: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, "subscriptions"), {
    userId: params.userId,
    serviceId: params.serviceId,
    serviceTitle: params.serviceTitle,
    serviceSlug: params.serviceSlug,
    price: params.price,
    locationId: params.locationId,
    address: params.address,
    frequency: params.frequency,
    preferredTime: params.preferredTime,
    status: "active",
    nextScheduledDate: params.startDate,
    skippedDates: [],
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

export async function skipNextVisit(
  id: string,
  dateToSkip: string,
  frequency: SubscriptionFrequency
): Promise<void> {
  const nextDate = getNextDate(dateToSkip, frequency);
  await updateDoc(doc(db, "subscriptions", id), {
    skippedDates: arrayUnion(dateToSkip),
    nextScheduledDate: nextDate,
  });
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

// Creates a booking from a subscription. Re-fetches the live service price.
export async function createBookingFromSubscription(
  sub: Subscription,
  userId: string
): Promise<string> {
  const serviceSnap = await getDoc(doc(db, "services", sub.serviceId));
  if (!serviceSnap.exists()) {
    throw new Error(`Service "${sub.serviceTitle}" is no longer available.`);
  }

  const resolved = resolveServiceForLocation(
    normalizeService(serviceSnap.id, serviceSnap.data() as Record<string, any>),
    sub.locationId as LocationId
  );

  const bookingRef = await addDoc(collection(db, "bookings"), {
    userId,
    serviceId: resolved.id,
    serviceSlug: resolved.slug,
    serviceTitle: resolved.title,
    price: resolved.price,
    totalPrice: resolved.price,
    locationId: sub.locationId,
    address: sub.address,
    scheduledDate: sub.nextScheduledDate,
    scheduledTime: sub.preferredTime,
    customerName: sub.address.name,
    customerPhone: sub.address.phone,
    paymentMode: "cod",
    status: "pending",
    subscriptionId: sub.id,
    createdAt: serverTimestamp(),
  });

  return bookingRef.id;
}

// Checks all active subscriptions for this user and creates bookings for due ones.
export async function processDueSubscriptions(userId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];
  const q = query(
    collection(db, "subscriptions"),
    where("userId", "==", userId),
    where("status", "==", "active")
  );
  const snap = await getDocs(q);

  let processed = 0;

  for (const docSnap of snap.docs) {
    const sub = { id: docSnap.id, ...docSnap.data() } as Subscription;
    if (sub.nextScheduledDate > today) continue;

    try {
      const bookingId = await createBookingFromSubscription(sub, userId);
      const nextDate = getNextDate(sub.nextScheduledDate, sub.frequency);
      await updateDoc(doc(db, "subscriptions", sub.id), {
        nextScheduledDate: nextDate,
        lastBookingId: bookingId,
      });
      processed++;
    } catch (err) {
      console.error(`Subscription ${sub.id} booking failed:`, err);
    }
  }

  return processed;
}
