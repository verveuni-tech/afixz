import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }: any) => {
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setStatus("denied");
        return;
      }

      const token = await user.getIdTokenResult(true); // force refresh

      if (token.claims.admin === true) {
        setStatus("allowed");
      } else {
        setStatus("denied");
      }
    });

    return () => unsubscribe();
  }, []);

  if (status === "loading") {
    return <div className="p-10">Checking access...</div>;
  }

  if (status === "denied") {
    return <Navigate to="/admin/login" />;
  }

  return children;
};

export default ProtectedRoute;