// src/hooks/usePhoneAuth.ts

import { useEffect, useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "../firebase";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export const usePhoneAuth = () => {
  const [confirmation, setConfirmation] =
    useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );

      window.recaptchaVerifier.render();
    }

    return () => {
      window.recaptchaVerifier?.clear();
    };
  }, []);

  const sendOtp = async (phone: string) => {
    setError(null);
    setLoading(true);

    try {
      if (!window.recaptchaVerifier) {
        throw new Error("Recaptcha not initialized");
      }

      const result = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );

      setConfirmation(result);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    if (!confirmation) return;

    setError(null);
    setLoading(true);

    try {
      await confirmation.confirm(otp);
    } catch {
      setError("Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  return {
    sendOtp,
    verifyOtp,
    confirmation,
    loading,
    error,
  };
};