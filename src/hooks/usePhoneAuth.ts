import { useEffect, useMemo, useState } from "react";
import {
  createPhoneAuthProvider,
  PhoneAuthSession,
  resetRecaptchaWidget,
} from "../auth/phone/providers";

export const usePhoneAuth = (containerId = "recaptcha-container") => {
  const provider = useMemo(
    () => createPhoneAuthProvider(containerId),
    [containerId]
  );
  const [confirmation, setConfirmation] =
    useState<PhoneAuthSession>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const initProvider = async () => {
      try {
        await provider.init();
        if (active) {
          setReady(true);
        }
      } catch (initError: any) {
        if (active) {
          setError(
            initError?.message ||
              "Phone verification could not be initialized."
          );
        }
      }
    };

    void initProvider();

    return () => {
      active = false;
      provider.cleanup();
    };
  }, [provider]);

  const sendOtp = async (phone: string) => {
    setError(null);
    setLoading(true);

    try {
      const result = await provider.sendOtp(phone);
      setConfirmation(result);
      return true;
    } catch (sendError: any) {
      setError(sendError?.message || "Failed to send OTP.");
      resetRecaptchaWidget();
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    setError(null);
    setLoading(true);

    try {
      await provider.verifyOtp(otp, confirmation);
      return true;
    } catch (verifyError: any) {
      setError(
        verifyError?.message || "Invalid verification code."
      );
      return false;
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
    ready,
    isAvailable: provider.isAvailable,
    providerMode: provider.mode,
    unavailableReason: provider.unavailableReason || null,
  };
};
