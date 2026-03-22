import { useState } from "react";
import { usePhoneAuth } from "../../hooks/usePhoneAuth";

interface Props {
  onSuccess?: () => void;
}

export default function PhoneLogin({ onSuccess }: Props) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const {
    confirmation,
    error,
    loading,
    ready,
    isAvailable,
    unavailableReason,
    sendOtp,
    verifyOtp,
  } = usePhoneAuth();

  const isValidPhone = /^\+[1-9]\d{7,14}$/.test(phone);

  const handleSendOtp = async () => {
    await sendOtp(phone);
  };

  const handleVerifyOtp = async () => {
    const success = await verifyOtp(otp);

    if (success && onSuccess) {
      onSuccess();
    }
  };

  if (!isAvailable) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Phone Login</h3>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-6 text-amber-800">
          {unavailableReason ||
            "Phone verification is temporarily unavailable."}
        </div>
        <p className="text-xs text-slate-500">
          Firebase sessions and protected routes continue to work, but OTP-based
          login needs the external provider integration before it can be enabled
          in production.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!confirmation ? (
        <>
          <h3 className="text-lg font-semibold">Login with Phone</h3>

          <input
            type="tel"
            placeholder="+91XXXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value.trim())}
            className="w-full rounded-lg border px-4 py-3"
          />

          <button
            disabled={!isValidPhone || loading || !ready}
            onClick={() => void handleSendOtp()}
            className="w-full rounded-lg bg-accent py-3 text-white disabled:opacity-50"
          >
            {loading ? "Sending..." : !ready ? "Preparing..." : "Send OTP"}
          </button>

          <div id="recaptcha-container" />
        </>
      ) : (
        <>
          <h3 className="text-lg font-semibold">Enter Verification Code</h3>

          <input
            type="text"
            placeholder="6-digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.trim())}
            className="w-full rounded-lg border px-4 py-3"
          />

          <button
            disabled={otp.length !== 6 || loading}
            onClick={() => void handleVerifyOtp()}
            className="w-full rounded-lg bg-accent py-3 text-white disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
