import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// Initialize Firebase Admin (once)
if (getApps().length === 0) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
  );
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function todayIST(): string {
  // IST = UTC+5:30
  const now = new Date();
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  return ist.toISOString().split("T")[0];
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Accept GET (Vercel Cron) and POST (manual trigger)
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "GET or POST only" });
  }

  // Auth: Vercel Cron sends this header automatically
  // For manual triggers, check API secret
  const cronSecret = req.headers["authorization"];
  const vercelCron = req.headers["x-vercel-cron"];
  const API_SECRET = process.env.NOTIFY_API_SECRET;

  const isVercelCron = vercelCron === "true" || vercelCron === "1";
  const isApiAuth = API_SECRET && cronSecret === `Bearer ${API_SECRET}`;

  if (!isVercelCron && !isApiAuth) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const today = todayIST();
    console.log(`[generate-visits] Running for date: ${today}`);

    // Query active subscriptions where nextVisitDate <= today
    const subsSnap = await db
      .collection("subscriptions")
      .where("status", "==", "active")
      .where("nextVisitDate", "<=", today)
      .get();

    if (subsSnap.empty) {
      console.log("[generate-visits] No visits due today");
      return res.status(200).json({
        success: true,
        message: "No visits due",
        generated: 0,
        date: today,
      });
    }

    const results: Array<{
      subscriptionId: string;
      bookingId: string;
      customerName: string;
      scheduledDate: string;
    }> = [];
    const errors: Array<{ subscriptionId: string; error: string }> = [];

    for (const subDoc of subsSnap.docs) {
      const sub = subDoc.data();

      try {
        // Check if endDate passed — subscription should be expired
        if (sub.endDate && sub.endDate < today) {
          await subDoc.ref.update({ status: "expired" });
          console.log(
            `[generate-visits] Expired subscription ${subDoc.id} (endDate: ${sub.endDate})`
          );
          continue;
        }

        // Check for duplicate — don't create if booking already exists for this date + subscription
        const dupCheck = await db
          .collection("bookings")
          .where("subscriptionId", "==", subDoc.id)
          .where("scheduledDate", "==", sub.nextVisitDate)
          .limit(1)
          .get();

        if (!dupCheck.empty) {
          console.log(
            `[generate-visits] Skip ${subDoc.id} — booking already exists for ${sub.nextVisitDate}`
          );
          // Still advance nextVisitDate so it doesn't get stuck
          await subDoc.ref.update({
            nextVisitDate: addDays(sub.nextVisitDate, 15),
          });
          continue;
        }

        // Create booking
        const bookingRef = await db.collection("bookings").add({
          userId: sub.userId,
          serviceId: "flying-mali",
          serviceSlug: "flying-mali",
          serviceTitle: `Flying Mali — ${sub.planName}`,
          price: sub.pricePerMonth,
          totalPrice: sub.pricePerMonth,
          locationId: sub.locationId,
          address: sub.address,
          scheduledDate: sub.nextVisitDate,
          scheduledTime: sub.preferredTime,
          paymentMode: "cod",
          status: "pending",
          source: "subscription",
          subscriptionId: subDoc.id,
          customerName: sub.customerName,
          customerPhone: sub.customerPhone,
          createdAt: FieldValue.serverTimestamp(),
        });

        // Advance nextVisitDate by 15 days
        const nextDate = addDays(sub.nextVisitDate, 15);
        await subDoc.ref.update({ nextVisitDate: nextDate });

        results.push({
          subscriptionId: subDoc.id,
          bookingId: bookingRef.id,
          customerName: sub.customerName || "Unknown",
          scheduledDate: sub.nextVisitDate,
        });

        console.log(
          `[generate-visits] Created booking ${bookingRef.id} for sub ${subDoc.id}, next: ${nextDate}`
        );
      } catch (err: any) {
        console.error(
          `[generate-visits] Error processing sub ${subDoc.id}:`,
          err
        );
        errors.push({ subscriptionId: subDoc.id, error: err.message });
      }
    }

    const summary = {
      success: true,
      date: today,
      generated: results.length,
      expired: subsSnap.size - results.length - errors.length,
      errors: errors.length,
      details: results,
      ...(errors.length > 0 && { errorDetails: errors }),
    };

    console.log("[generate-visits] Summary:", JSON.stringify(summary));
    return res.status(200).json(summary);
  } catch (err: any) {
    console.error("[generate-visits] Fatal error:", err);
    return res.status(500).json({ error: err.message || "Internal error" });
  }
}
