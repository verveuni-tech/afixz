import {
  onAuthStateChanged,
  User,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import React, {
  createContext,
  useEffect,
  useState,
  useContext,
  ReactNode,
} from "react";
import { auth, db } from "../firebase";
import type { LocationId } from "../lib/locations";

/* ---------------- Types ---------------- */

export interface UserProfile {
  uid: string;
  phone: string | null;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string | null;
  role: "user" | "admin" | "provider";
  selectedLocation?: LocationId | null;
  createdAt?: any;
  updatedAt?: any;
}

function createAuthProfile(
  firebaseUser: User,
  role: UserProfile["role"],
  provider: string | null,
  timestamps: { createdAt?: any; updatedAt?: any } = {}
): UserProfile {
  return {
    uid: firebaseUser.uid,
    phone: firebaseUser.phoneNumber || null,
    email: firebaseUser.email || null,
    displayName: firebaseUser.displayName || null,
    photoURL: firebaseUser.photoURL || null,
    provider,
    role,
    ...timestamps,
  };
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isProvider: boolean;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

/* ---------------- Context ---------------- */

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isProvider, setIsProvider] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setLoading(true);

        if (!firebaseUser) {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
          setIsProvider(false);
          setLoading(false);
          return;
        }

        setUser(firebaseUser);

        try {
          /* ---------- Check Custom Claims ---------- */

          const token = await firebaseUser.getIdTokenResult(
            true
          );
          const adminStatus =
            token.claims.admin === true;
          const providerStatus =
            token.claims.provider === true;
          const role = adminStatus ? "admin" : providerStatus ? "provider" : "user";

          setIsAdmin(adminStatus);
          setIsProvider(providerStatus);

          /* ---------- Ensure Firestore Profile Exists ---------- */

          const userRef = doc(
            db,
            "users",
            firebaseUser.uid
          );

          // Determine provider: Firebase email-link reports as "password"
          const rawProvider =
            firebaseUser.providerData[0]?.providerId || "unknown";
          const resolvedProvider =
            rawProvider === "password"
              ? "email"
              : rawProvider === "google.com"
                ? "google.com"
                : firebaseUser.phoneNumber
                  ? "phone"
                  : rawProvider;

          let snap;
          try {
            snap = await getDoc(userRef);
          } catch (profileReadErr) {
            console.warn(
              "Profile read failed; continuing with auth token profile:",
              profileReadErr
            );
            setProfile(
              createAuthProfile(firebaseUser, role, resolvedProvider)
            );
            setLoading(false);
            return;
          }

          if (!snap.exists()) {
            const newProfile = createAuthProfile(
              firebaseUser,
              role,
              resolvedProvider,
              {
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              }
            );

            try {
              await setDoc(userRef, newProfile);
              // Re-read to get server timestamps resolved
              const freshSnap = await getDoc(userRef);
              setProfile(
                freshSnap.exists()
                  ? (freshSnap.data() as UserProfile)
                  : newProfile
              );
            } catch (createErr) {
              console.error(
                "Profile creation failed:",
                createErr
              );
              // Still set local profile so UI works
              setProfile({
                ...newProfile,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
          } else {
            const existingProfile =
              snap.data() as UserProfile;

            // Sync provider if user signed in with different method
            // e.g., first used email link, now using Google
            const needsProviderUpdate =
              !existingProfile.provider ||
              (existingProfile.provider !== resolvedProvider &&
                resolvedProvider !== "unknown");

            // Sync role: if custom claims grant a higher role than Firestore stores
            // e.g. admin granted "provider" claim → Firestore role still says "user"
            const needsRoleSync = existingProfile.role !== role && role !== "user";

            // Sync email/displayName/photoURL from latest auth
            const needsInfoSync =
              (firebaseUser.email && existingProfile.email !== firebaseUser.email) ||
              (firebaseUser.displayName && !existingProfile.displayName) ||
              (firebaseUser.photoURL && !existingProfile.photoURL);

            if (needsProviderUpdate || needsRoleSync || needsInfoSync) {
              try {
                const updates: Record<string, any> = {
                  updatedAt: serverTimestamp(),
                };
                if (needsProviderUpdate) {
                  updates.provider = resolvedProvider;
                }
                if (needsRoleSync) {
                  updates.role = role;
                  existingProfile.role = role; // update local copy immediately
                }
                if (firebaseUser.email) {
                  updates.email = firebaseUser.email;
                }
                if (firebaseUser.displayName && !existingProfile.displayName) {
                  updates.displayName = firebaseUser.displayName;
                }
                if (firebaseUser.photoURL && !existingProfile.photoURL) {
                  updates.photoURL = firebaseUser.photoURL;
                }

                await updateDoc(userRef, updates);
                Object.assign(existingProfile, updates);
              } catch (syncErr) {
                console.warn(
                  "Profile sync failed:",
                  syncErr
                );
              }
            }

            setProfile(existingProfile);
          }
        } catch (err) {
          console.error(
            "Auth initialization error:",
            err
          );
        }

        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      }
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        isProvider,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ---------------- Hook ---------------- */

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};
