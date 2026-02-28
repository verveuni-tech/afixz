import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export const useRequireAuth = () => {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [pendingAction, setPendingAction] =
    useState<(() => void) | null>(null);

  const requireAuth = (action: () => void) => {
    if (user) {
      action();
    } else {
      setPendingAction(() => action);
      setShowLogin(true);
    }
  };

  const handleLoginSuccess = () => {
    setShowLogin(false);
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  return {
    requireAuth,
    showLogin,
    setShowLogin,
    handleLoginSuccess,
  };
};