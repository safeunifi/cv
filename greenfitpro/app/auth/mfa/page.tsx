"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Shield, QrCode, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase";

type Step = "verify" | "enroll" | "enrolled";

export default function MFAPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("verify");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [hasMFA, setHasMFA] = useState(false);

  useEffect(() => {
    checkMFA();
  }, []);

  const checkMFA = async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = data?.totp?.filter((f) => f.status === "verified") ?? [];
    if (verified.length > 0) {
      setHasMFA(true);
      setFactorId(verified[0].id);
      const { data: challengeData } = await supabase.auth.mfa.challenge({ factorId: verified[0].id });
      if (challengeData) setChallengeId(challengeData.id);
      setStep("verify");
    } else {
      setStep("enroll");
      enrollMFA();
    }
  };

  const enrollMFA = async () => {
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.mfa.enroll({ factorType: "totp", issuer: "GreenFit Pro" });
    if (err || !data) { setError(err?.message || "Enrollment failed"); return; }
    setFactorId(data.id);
    setQrCode(data.totp.qr_code);
    const { data: challengeData } = await supabase.auth.mfa.challenge({ factorId: data.id });
    if (challengeData) setChallengeId(challengeData.id);
  };

  const verify = async () => {
    if (code.length !== 6) { setError("Enter the 6-digit code from your authenticator app."); return; }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
    setLoading(false);
    if (err) { setError("Invalid code. Try again."); return; }
    if (step === "enroll") {
      setStep("enrolled");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <Shield size={48} className="mx-auto mb-3" style={{ color: "var(--primary)" }} />
          <h1 className="text-2xl font-black" style={{ color: "var(--text)" }}>
            {step === "enroll" ? "Set Up 2-Step Verification" :
             step === "verify" ? "Verify Your Identity" :
             "2FA Enabled!"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {step === "enroll" ? "Scan the QR code with your authenticator app" :
             step === "verify" ? "Enter the code from your authenticator app" :
             "Your account is now protected"}
          </p>
        </div>

        {step === "enrolled" ? (
          <Card className="p-6 flex flex-col items-center gap-4">
            <CheckCircle size={56} style={{ color: "var(--primary)" }} />
            <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
              Two-factor authentication is active. You&apos;ll need your authenticator app each time you sign in.
            </p>
            <Button variant="primary" size="lg" fullWidth onClick={() => router.push("/")}>
              Continue to App
            </Button>
          </Card>
        ) : (
          <Card className="p-5 space-y-4">
            {step === "enroll" && qrCode && (
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 bg-white rounded-xl">
                  <QrCode size={32} />
                  {/* In a real app, render the qrCode SVG/URL here */}
                  <p className="text-xs text-center mt-1 text-gray-500">QR Code</p>
                </div>
                <p className="text-xs text-center" style={{ color: "var(--text-muted)" }}>
                  Scan with Google Authenticator, Authy, or any TOTP app
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>
                6-Digit Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="w-full p-3 rounded-xl text-center text-2xl font-mono tracking-widest outline-none"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
              />
            </div>

            {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              onClick={verify}
              disabled={code.length !== 6}
            >
              {step === "enroll" ? "Enable 2FA" : "Verify & Continue"}
            </Button>

            {hasMFA && (
              <button
                className="w-full text-center text-sm"
                style={{ color: "var(--text-muted)" }}
                onClick={() => router.push("/")}
              >
                Skip for now
              </button>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
