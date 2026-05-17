import { auth } from "./firebase";

interface NotifyOrderPayload {
  type: "online_booking";
  name: string;
  email: string;
  phone: string;
  service: string;
  address: string;
  scheduledDate?: string;
  scheduledTime?: string;
  price?: number;
  bookingId?: string;
}

export async function sendOrderNotification(payload: NotifyOrderPayload): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    const idToken = currentUser ? await currentUser.getIdToken() : null;

    await fetch("/api/notify-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Non-blocking — don't fail order if email fails
    console.error("Order notification failed:", err);
  }
}
