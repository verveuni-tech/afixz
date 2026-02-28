import { useEffect, useState } from "react";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "../../firebase";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    recaptchaWidgetId?: number;
    grecaptcha?: {
      reset: (widgetId?: number) => void;
    };
  }
}
interface Props {
  onSuccess?: () => void;
}

export default function PhoneLogin({ onSuccess }: Props) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] =
    useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------------------------------- */
  /* Initialize reCAPTCHA once */
  /* -------------------------------------------------- */

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );

      window.recaptchaVerifier.render().then((widgetId) => {
        window.recaptchaWidgetId = widgetId;
      });
    }
  }, []);

  /* -------------------------------------------------- */
  /* Send OTP */
  /* -------------------------------------------------- */

  const sendOtp = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!window.recaptchaVerifier) {
        throw new Error("reCAPTCHA not initialized");
      }

      const result = await signInWithPhoneNumber(
        auth,
        phone,
        window.recaptchaVerifier
      );

      setConfirmation(result);
    } catch (err: any) {
      console.error("OTP error:", err);
      setError(err.message || "Failed to send OTP");

      // Reset reCAPTCHA on failure
      if (
        window.recaptchaWidgetId !== undefined &&
        window.grecaptcha
      ) {
        window.grecaptcha.reset(
          window.recaptchaWidgetId
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------- */
  /* Verify OTP */
  /* -------------------------------------------------- */

  const verifyOtp = async () => {
    if (!confirmation) return;

    setError(null);
    setLoading(true);

    try {
      await confirmation.confirm(otp);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Verify error:", err);
      setError("Invalid verification code");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------- */
  /* Validation */
  /* -------------------------------------------------- */

  const isValidPhone = /^\+[1-9]\d{7,14}$/.test(phone);

  /* -------------------------------------------------- */
  /* UI */
  /* -------------------------------------------------- */

  return (
    <div className="space-y-4">
      {!confirmation ? (
        <>
          <h3 className="text-lg font-semibold">
            Login with Phone
          </h3>

          <input
            type="tel"
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value.trim())
            }
            className="w-full border rounded-lg px-4 py-3"
          />

          <button
            disabled={!isValidPhone || loading}
            onClick={sendOtp}
            className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>

          <div id="recaptcha-container" />
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold">
            Enter Verification Code
          </h3>

          <input
            type="text"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.trim())
            }
            className="w-full border rounded-lg px-4 py-3"
          />

          <button
            disabled={otp.length !== 6 || loading}
            onClick={verifyOtp}
            className="w-full bg-blue-600 text-white py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </>
      )}

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}