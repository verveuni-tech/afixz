export type PhoneAuthMode = "firebase" | "external" | "disabled";

const VALID_MODES: PhoneAuthMode[] = ["firebase", "external", "disabled"];

export function getPhoneAuthMode(): PhoneAuthMode {
  const configured = import.meta.env.VITE_PHONE_AUTH_PROVIDER;

  if (configured && VALID_MODES.includes(configured as PhoneAuthMode)) {
    return configured as PhoneAuthMode;
  }

  return import.meta.env.DEV ? "firebase" : "disabled";
}

export const phoneAuthMode = getPhoneAuthMode();
