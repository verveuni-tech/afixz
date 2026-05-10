interface NotifyOrderPayload {
  type: "online_booking" | "offline_booking";
  name: string;
  email: string;
  phone: string;
  service: string;
  address: string;
  scheduledDate?: string;
  scheduledTime?: string;
  price?: number;
  notes?: string;
  bookingId?: string;
}

export async function sendOrderNotification(payload: NotifyOrderPayload): Promise<void> {
  try {
    const secret = import.meta.env.VITE_NOTIFY_API_SECRET || "";
    await fetch("/api/notify-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-secret": secret,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Non-blocking — don't fail order if email fails
    console.error("Order notification failed:", err);
  }
}
