import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { checkRateLimit, getRateLimitKey } from "./_ratelimit";

// Initialize Firebase Admin (once)
if (getApps().length === 0) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
  );
  initializeApp({ credential: cert(serviceAccount) });
}

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "admin@afixz.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "AfixZ <orders@afixz.com>";
const API_SECRET = process.env.NOTIFY_API_SECRET;

interface OrderPayload {
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

function buildCustomerEmail(data: OrderPayload): { subject: string; html: string } {
  return {
    subject: `AfixZ — Your Booking is Confirmed!`,
    html: `
      <div style="font-family:'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1f2933">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#f36b21;font-size:24px;margin:0">AfixZ</h1>
        </div>
        <h2 style="font-size:20px;margin-bottom:8px">Hi ${data.name},</h2>
        <p style="color:#475569;line-height:1.6">
          Your booking has been confirmed! Here are the details:
        </p>
        <div style="background:#f9fafb;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin:20px 0">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#64748b">Service</td><td style="padding:6px 0;font-weight:600">${data.service}</td></tr>
            ${data.scheduledDate ? `<tr><td style="padding:6px 0;color:#64748b">Date</td><td style="padding:6px 0;font-weight:600">${data.scheduledDate}</td></tr>` : ""}
            ${data.scheduledTime ? `<tr><td style="padding:6px 0;color:#64748b">Time</td><td style="padding:6px 0;font-weight:600">${data.scheduledTime}</td></tr>` : ""}
            ${data.price ? `<tr><td style="padding:6px 0;color:#64748b">Amount</td><td style="padding:6px 0;font-weight:600;color:#f36b21">₹${data.price} (COD)</td></tr>` : ""}
            ${data.bookingId ? `<tr><td style="padding:6px 0;color:#64748b">Booking ID</td><td style="padding:6px 0;font-weight:600;font-family:monospace">${data.bookingId}</td></tr>` : ""}
          </table>
        </div>
        <p style="color:#475569;font-size:14px;line-height:1.6">
          <strong>Payment:</strong> Cash on Delivery — pay when our professional arrives.
        </p>
        <p style="color:#64748b;font-size:13px;line-height:1.6">
          If you have any questions, reply to this email or call us at +91 98765 43210.
        </p>
        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;color:#94a3b8;font-size:11px">
          &copy; ${new Date().getFullYear()} AfixZ. All rights reserved.
        </div>
      </div>
    `,
  };
}

function buildAdminEmail(data: OrderPayload): { subject: string; html: string } {
  return {
    subject: `🔔 New Order: ${data.service} — ${data.name}`,
    html: `
      <div style="font-family:'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1f2933">
        <h2 style="color:#f36b21;font-size:18px;margin-bottom:16px">New Order Received</h2>
        <div style="background:#f9fafb;border:1px solid #e2e8f0;border-radius:12px;padding:20px">
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 0;color:#64748b;width:120px">Customer</td><td style="padding:6px 0;font-weight:600">${data.name}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Email</td><td style="padding:6px 0">${data.email}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Phone</td><td style="padding:6px 0">${data.phone}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Service</td><td style="padding:6px 0;font-weight:600">${data.service}</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Address</td><td style="padding:6px 0">${data.address}</td></tr>
            ${data.scheduledDate ? `<tr><td style="padding:6px 0;color:#64748b">Date</td><td style="padding:6px 0">${data.scheduledDate}</td></tr>` : ""}
            ${data.scheduledTime ? `<tr><td style="padding:6px 0;color:#64748b">Time</td><td style="padding:6px 0">${data.scheduledTime}</td></tr>` : ""}
            ${data.price ? `<tr><td style="padding:6px 0;color:#64748b">Amount</td><td style="padding:6px 0;font-weight:600;color:#f36b21">₹${data.price} (COD)</td></tr>` : ""}
            ${data.bookingId ? `<tr><td style="padding:6px 0;color:#64748b">Booking ID</td><td style="padding:6px 0;font-family:monospace">${data.bookingId}</td></tr>` : ""}
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
  // CORS — restrict to own domains
  const allowedOrigins = [
    "https://afixz.vercel.app",
    "https://afixz.com",
    "https://www.afixz.com",
  ];
  const origin = req.headers.origin || "";
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Auth: accept Firebase ID token (preferred) OR static API secret (legacy)
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const legacySecret = req.headers["x-api-secret"] as string;

  const isStaticSecret = API_SECRET && legacySecret === API_SECRET;

  let callerUid: string | null = null;

  if (!isStaticSecret) {
    if (!bearerToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    try {
      const decoded = await getAuth().verifyIdToken(bearerToken);
      callerUid = decoded.uid;
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  }

  // Rate limit: 10 requests per minute per user (prevents email spam)
  const rateLimitKey = callerUid
    ? `uid:${callerUid}`
    : getRateLimitKey(req);
  const allowed = await checkRateLimit(req, res, {
    prefix: "notify-order",
    limit: 10,
    window: "1 m",
  }, rateLimitKey);
  if (!allowed) return;

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

  // Prevent using as arbitrary email relay — verify caller owns the email
  if (callerUid) {
    try {
      const callerRecord = await getAuth().getUser(callerUid);
      if (callerRecord.email && callerRecord.email !== data.email) {
        // Admin override check
        const token = await getAuth().verifyIdToken(
          (req.headers.authorization || "").slice(7)
        );
        if (!token.admin) {
          return res.status(403).json({ error: "Email mismatch" });
        }
      }
    } catch {
      // Non-fatal — allow if lookup fails
    }
  }

  // Sanitize all string inputs
  data.name = escapeHtml(data.name);
  data.email = escapeHtml(data.email);
  data.phone = escapeHtml(data.phone || "");
  data.service = escapeHtml(data.service);
  data.address = escapeHtml(data.address || "");
  data.bookingId = escapeHtml(data.bookingId || "");

  const results = { customer: false, admin: false };

  try {
    const customerEmail = buildCustomerEmail(data);
    const customerRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: FROM_EMAIL, to: [data.email], subject: customerEmail.subject, html: customerEmail.html }),
    });
    results.customer = customerRes.ok;
  } catch (err) {
    console.error("Customer email failed:", err);
  }

  try {
    const adminEmail = buildAdminEmail(data);
    const adminRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: FROM_EMAIL, to: [ADMIN_EMAIL], subject: adminEmail.subject, html: adminEmail.html }),
    });
    results.admin = adminRes.ok;
  } catch (err) {
    console.error("Admin email failed:", err);
  }

  return res.status(200).json({ success: true, results });
}
