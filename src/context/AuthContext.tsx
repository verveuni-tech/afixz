import {
  onAuthStateChanged,
  User,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
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
              provider:
                firebaseUser.providerData[0]
                  ?.providerId || null,
              role: adminStatus ? "admin" : "user",
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            };

            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          } else {
            const existingProfile =
              snap.data() as UserProfile;

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

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        logout,
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
