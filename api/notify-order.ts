import type { VercelRequest, VercelResponse } from "@vercel/node";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@afixz.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "AfixZ <orders@afixz.com>";
const API_SECRET = process.env.NOTIFY_API_SECRET;

// ---------- Server-side rate limiting (in-memory, per-IP) ----------
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 10; // max 10 requests per IP per hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
}

// Clean stale entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 10 * 60 * 1000);

interface OrderPayload {
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

function buildCustomerEmail(data: OrderPayload): { subject: string; html: string } {
  const isOnline = data.type === "online_booking";
  return {
    subject: `AfixZ — Your ${isOnline ? "Booking" : "Service Request"} is Confirmed!`,
    html: `
      <div style="font-family:'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1f2933">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#f36b21;font-size:24px;margin:0">AfixZ</h1>
        </div>
        <h2 style="font-size:20px;margin-bottom:8px">Hi ${data.name},</h2>
        <p style="color:#475569;line-height:1.6">
          ${isOnline
            ? "Your booking has been confirmed! Here are the details:"
            : "We've received your service request. Our team will contact you shortly to confirm your appointment."}
        </p>
        <div style="background:#f9fafb;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#64748b">Service</td><td style="padding:6px 0;font-weight:600">${data.service}</td></tr>
            ${data.scheduledDate ? `<tr><td style="padding:6px 0;color:#64748b">Date</td><td style="padding:6px 0;font-weight:600">${data.scheduledDate}</td></tr>` : ""}
            ${data.scheduledTime ? `<tr><td style="padding:6px 0;color:#64748b">Time</td><td style="padding:6px 0;font-weight:600">${data.scheduledTime}</td></tr>` : ""}
            ${data.price ? `<tr><td style="padding:6px 0;color:#64748b">Amount</td><td style="padding:6px 0;font-weight:600;color:#f36b21">₹${data.price}</td></tr>` : ""}
            ${data.bookingId ? `<tr><td style="padding:6px 0;color:#64748b">Booking ID</td><td style="padding:6px 0;font-weight:600;font-family:monospace">${data.bookingId}</td></tr>` : ""}
          </table>
        </div>
        <p style="color:#64748b;font-size:13px;line-height:1.6">
          If you have any questions, reply to this email or call us at +91 98765 43210.
        </p>
        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;color:#94a3b8;font-size:11px">
          © ${new Date().getFullYear()} AfixZ. All rights reserved.
        </div>
      </div>
    `,
  };
}

function buildAdminEmail(data: OrderPayload): { subject: string; html: string } {
  const isOnline = data.type === "online_booking";
  return {
    subject: `🔔 New ${isOnline ? "Order" : "Offline Booking"}: ${data.service} — ${data.name}`,
    html: `
      <div style="font-family:'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1f2933">
        <h2 style="color:#f36b21;font-size:18px;margin-bottom:16px">New ${isOnline ? "Order" : "Offline Booking Request"}</h2>
        <div style="background:#f9fafb;border:1px solid #e2e8f0;border-radius:12px;padding:20px">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#64748b;width:120px">Customer</td><td style="padding:6px 0;font-weight:600">${data.name}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Email</td><td style="padding:6px 0">${data.email}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Phone</td><td style="padding:6px 0">${data.phone}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Service</td><td style="padding:6px 0;font-weight:600">${data.service}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Address</td><td style="padding:6px 0">${data.address}</td></tr>
            ${data.scheduledDate ? `<tr><td style="padding:6px 0;color:#64748b">Date</td><td style="padding:6px 0">${data.scheduledDate}</td></tr>` : ""}
            ${data.scheduledTime ? `<tr><td style="padding:6px 0;color:#64748b">Time</td><td style="padding:6px 0">${data.scheduledTime}</td></tr>` : ""}
            ${data.price ? `<tr><td style="padding:6px 0;color:#64748b">Amount</td><td style="padding:6px 0;font-weight:600;color:#f36b21">₹${data.price}</td></tr>` : ""}
            ${data.bookingId ? `<tr><td style="padding:6px 0;color:#64748b">Booking ID</td><td style="padding:6px 0;font-family:monospace">${data.bookingId}</td></tr>` : ""}
            ${data.notes ? `<tr><td style="padding:6px 0;color:#64748b">Notes</td><td style="padding:6px 0">${data.notes}</td></tr>` : ""}
          </table>
        </div>
      </div>
    `,
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\r?\n/g, " ")
    .slice(0, 500);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting by IP
  const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: "Too many requests. Try again later." });
  }

  // API secret validation — prevents unauthenticated calls
  const authHeader = req.headers["x-api-secret"] as string;
  if (API_SECRET && authHeader !== API_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!RESEND_API_KEY) {
    console.error("RESEND_API_KEY not configured");
    return res.status(500).json({ error: "Email service not configured" });
  }

  // Reject oversized payloads
  const bodyStr = JSON.stringify(req.body);
  if (bodyStr.length > 5000) {
    return res.status(413).json({ error: "Payload too large" });
  }

  const data = req.body as OrderPayload;

  if (!data.name || !data.email || !data.service) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Sanitize all string inputs to prevent HTML/header injection
  data.name = escapeHtml(data.name);
  data.email = escapeHtml(data.email);
  data.phone = escapeHtml(data.phone || "");
  data.service = escapeHtml(data.service);
  data.address = escapeHtml(data.address || "");
  data.notes = escapeHtml(data.notes || "");
  data.bookingId = escapeHtml(data.bookingId || "");

  const results = { customer: false, admin: false };

  try {
    // Send customer email
    const customerEmail = buildCustomerEmail(data);
    const customerRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [data.email],
        subject: customerEmail.subject,
        html: customerEmail.html,
      }),
    });
    results.customer = customerRes.ok;
  } catch (err) {
    console.error("Customer email failed:", err);
  }

  try {
    // Send admin email
    const adminEmail = buildAdminEmail(data);
    const adminRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        subject: adminEmail.subject,
        html: adminEmail.html,
      }),
    });
    results.admin = adminRes.ok;
  } catch (err) {
    console.error("Admin email failed:", err);
  }

  return res.status(200).json({ success: true, results });
}
