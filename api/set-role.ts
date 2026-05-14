import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Initialize Firebase Admin (once)
if (getApps().length === 0) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || "{}"
  );
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const API_SECRET = process.env.NOTIFY_API_SECRET;

type Role = "admin" | "provider";
const VALID_ROLES: Role[] = ["admin", "provider"];

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  // Accept either:
  //   a) static API secret  → "Bearer <NOTIFY_API_SECRET>"
  //   b) admin Firebase ID token → verify token + check admin claim
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const isStaticSecret = API_SECRET && token === API_SECRET;

  if (!isStaticSecret) {
    // Verify as Firebase ID token and require admin claim
    try {
      const decoded = await getAuth().verifyIdToken(token);
      if (!decoded.admin) {
        return res.status(403).json({ error: "Forbidden: admin claim required" });
      }
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  }

  const { uid, email, role, action } = req.body || {};

  // Validate
  if (!role || !VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Use: ${VALID_ROLES.join(", ")}` });
  }
  if (action && action !== "grant" && action !== "revoke") {
    return res.status(400).json({ error: 'Action must be "grant" or "revoke"' });
  }

  const shouldGrant = action !== "revoke";

  try {
    const adminAuth = getAuth();

    // Resolve UID from email if needed
    let targetUid = uid;
    if (!targetUid && email) {
      const userRecord = await adminAuth.getUserByEmail(email);
      targetUid = userRecord.uid;
    }

    if (!targetUid) {
      return res.status(400).json({ error: "Provide uid or email" });
    }

    // Get current claims
    const user = await adminAuth.getUser(targetUid);
    const currentClaims = user.customClaims || {};

    // Set claim
    const newClaims = { ...currentClaims };
    if (shouldGrant) {
      newClaims[role] = true;
    } else {
      delete newClaims[role];
    }

    await adminAuth.setCustomUserClaims(targetUid, newClaims);

    return res.status(200).json({
      success: true,
      uid: targetUid,
      email: user.email,
      displayName: user.displayName,
      action: shouldGrant ? "granted" : "revoked",
      role,
      claims: newClaims,
    });
  } catch (err: any) {
    console.error("set-role error:", err);

    if (err.code === "auth/user-not-found") {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(500).json({ error: err.message || "Internal error" });
  }
}
