import {
  ConfirmationResult,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth } from "../../firebase";
import { phoneAuthMode, PhoneAuthMode } from "./config";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    recaptchaWidgetId?: number;
    grecaptcha?: {
      reset: (widgetId?: number) => void;
    };
  }
}

export type PhoneAuthSession = ConfirmationResult | null;

export interface PhoneAuthProvider {
  mode: PhoneAuthMode;
  isAvailable: boolean;
  unavailableReason?: string;
  init: () => Promise<void>;
  sendOtp: (phone: string) => Promise<PhoneAuthSession>;
  verifyOtp: (otp: string, session: PhoneAuthSession) => Promise<void>;
  cleanup: () => void;
}

export function createPhoneAuthProvider(
  containerId: string
): PhoneAuthProvider {
  if (phoneAuthMode === "firebase") {
    return createFirebasePhoneAuthProvider(containerId);
  }

  if (phoneAuthMode === "external") {
    return createUnavailableProvider(
      "external",
      "External OTP verification is not configured yet. Please connect the client provider details first."
    );
  }

  return createUnavailableProvider(
    "disabled",
    "Phone verification is temporarily unavailable in this environment."
  );
}

function createFirebasePhoneAuthProvider(
  containerId: string
): PhoneAuthProvider {
  return {
    mode: "firebase",
    isAvailable: true,
    async init() {
      if (window.recaptchaVerifier) {
        return;
      }

      const container = document.getElementById(containerId);

      if (!container) {
        throw new Error("Phone verification container is missing.");
      }

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        containerId,
        { size: "invisible" }
      );

      window.recaptchaWidgetId = await window.recaptchaVerifier.render();
    },
    async sendOtp(phone: string) {
      if (!window.recaptchaVerifier) {
        throw new Error("Phone verification is not initialized yet.");
      }

      return signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
    },
    async verifyOtp(otp: string, session: PhoneAuthSession) {
      if (!session) {
        throw new Error("Please request an OTP first.");
      }

      await session.confirm(otp);
    },
    cleanup() {
      window.recaptchaVerifier?.clear();
      window.recaptchaVerifier = undefined;
      window.recaptchaWidgetId = undefined;
    },
  };
}

function createUnavailableProvider(
  mode: Exclude<PhoneAuthMode, "firebase">,
  unavailableReason: string
): PhoneAuthProvider {
  const fail = async () => {
    throw new Error(unavailableReason);
  };

  return {
    mode,
    isAvailable: false,
    unavailableReason,
    init: async () => undefined,
    sendOtp: fail,
    verifyOtp: fail,
    cleanup: () => undefined,
  };
}

export function resetRecaptchaWidget() {
  if (
    window.recaptchaWidgetId !== undefined &&
    window.grecaptcha
  ) {
    window.grecaptcha.reset(window.recaptchaWidgetId);
  }
}
