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
  role: "user" | "admin";
  selectedLocation?: LocationId | null;
  createdAt?: any;
  updatedAt?: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        setLoading(true);

        if (!firebaseUser) {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
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

          setIsAdmin(adminStatus);

          /* ---------- Ensure Firestore Profile Exists ---------- */

          const userRef = doc(
            db,
            "users",
            firebaseUser.uid
          );

          const snap = await getDoc(userRef);

          if (!snap.exists()) {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              phone:
                firebaseUser.phoneNumber || null,
              email: firebaseUser.email || null,
              displayName:
                firebaseUser.displayName || null,
              photoURL:
                firebaseUser.photoURL || null,
              provider:
                firebaseUser.providerData[0]
                  ?.providerId ||
                (firebaseUser.phoneNumber
                  ? "phone"
                  : "unknown"),
              role: adminStatus ? "admin" : "user",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };

            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          } else {
            const existingProfile =
              snap.data() as UserProfile;

            // Migrate profiles with missing provider
            if (
              !existingProfile.provider &&
              firebaseUser.phoneNumber
            ) {
              try {
                await updateDoc(userRef, {
                  provider: "phone",
                  updatedAt: serverTimestamp(),
                });
                existingProfile.provider = "phone";
              } catch (migrationErr) {
                console.warn(
                  "Provider migration failed:",
                  migrationErr
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
