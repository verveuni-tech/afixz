import type { VercelRequest, VercelResponse } from "@vercel/node";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { checkRateLimit } from "./_ratelimit.js";

type Role = "admin" | "provider";

const VALID_ROLES: Role[] = ["admin", "provider"];

function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY is missing");
  }

  let serviceAccount;

  try {
    serviceAccount = JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `FIREBASE_SERVICE_ACCOUNT_KEY is invalid JSON: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

const API_SECRET = process.env.NOTIFY_API_SECRET;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Ensure Firebase Admin is initialized
    getFirebaseApp();

    // CORS
    const allowedOrigins = [
      "https://afixz.com",
      "https://www.afixz.com",
      "https://afixz.vercel.app",
    ];

    const origin = req.headers.origin || "";

    if (allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    }

    res.setHeader(
      "Access-Control-Allow-Headers",
      "Authorization, Content-Type"
    );

    res.setHeader(
      "Access-Control-Allow-Methods",
      "POST, OPTIONS"
    );

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({
        error: "POST only",
      });
    }

    const allowed = await checkRateLimit(req, res, {
      prefix: "set-role",
      limit: 5,
      windowMs: 60_000,
    });

    if (!allowed) return;

    // Reject oversized payloads
    if (req.body && JSON.stringify(req.body).length > 2000) {
      return res.status(413).json({ error: "Payload too large" });
    }

    const authHeader = req.headers.authorization || "";

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : "";

    if (!token) {
      return res.status(401).json({
        error: "Missing Authorization token",
      });
    }

    const auth = getAuth();

    const usingStaticSecret =
      API_SECRET && token === API_SECRET;

    if (!usingStaticSecret) {
      try {
        const decoded = await auth.verifyIdToken(token);

        if (!decoded.admin) {
          return res.status(403).json({
            error: "Admin claim required",
          });
        }
      } catch (err) {
        console.error("Token verification failed", err);

        return res.status(401).json({
          error: "Invalid token",
        });
      }
    }

    const { uid, email, role, action } = req.body || {};

    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({
        error: `Role must be one of: ${VALID_ROLES.join(", ")}`,
      });
    }

    if (
      action &&
      action !== "grant" &&
      action !== "revoke"
    ) {
      return res.status(400).json({
        error: 'Action must be "grant" or "revoke"',
      });
    }

    let targetUid = uid;

    if (!targetUid && email) {
      try {
        const user = await auth.getUserByEmail(email);
        targetUid = user.uid;
      } catch (err: any) {
        if (err?.errorInfo?.code === "auth/user-not-found") {
          return res.status(404).json({
            error: `No account found for ${email}. User must sign up first.`,
          });
        }
        throw err;
      }
    }

    if (!targetUid) {
      return res.status(400).json({
        error: "Provide uid or email",
      });
    }

    let targetUser;
    try {
      targetUser = await auth.getUser(targetUid);
    } catch (err: any) {
      if (err?.errorInfo?.code === "auth/user-not-found") {
        return res.status(404).json({
          error: "User not found.",
        });
      }
      throw err;
    }

    const currentClaims = targetUser.customClaims || {};

    const shouldGrant = action !== "revoke";

    const newClaims = { ...currentClaims };

    if (shouldGrant) {
      newClaims[role] = true;
    } else {
      delete newClaims[role];
    }

    await auth.setCustomUserClaims(
      targetUid,
      newClaims
    );

    const firestoreRole = shouldGrant
      ? role
      : "user";

    try {
      await getFirestore()
        .collection("users")
        .doc(targetUid)
        .set(
          {
            role: firestoreRole,
          },
          { merge: true }
        );
    } catch (firestoreError) {
      console.warn(
        "Firestore role sync failed:",
        firestoreError
      );
    }

    return res.status(200).json({
      success: true,
      uid: targetUid,
      email: targetUser.email,
      displayName: targetUser.displayName,
      action: shouldGrant ? "granted" : "revoked",
      role,
      firestoreRole,
      claims: newClaims,
    });
  } catch (err) {
    console.error("SET ROLE ERROR:", err);

    return res.status(500).json({
      error:
        err instanceof Error
          ? err.message
          : "Internal server error",
    });
  }
}