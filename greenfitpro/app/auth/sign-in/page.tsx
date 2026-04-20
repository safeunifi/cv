"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    // Check if MFA is enrolled
    const { data: factors } = await supabase.auth.mfa.listFactors();
    if (factors?.totp?.length) {
      router.push("/auth/mfa");
    } else {
      router.push("/");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <span className="text-5xl">⛳</span>
          <h1 className="text-2xl font-black mt-2" style={{ color: "var(--text)" }}>GreenFit Pro</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Sign in to your account</p>
        </div>

        <Card className="p-5">
          <form onSubmit={signIn} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>
                Email
              </label>
              <div
                className="flex items-center gap-2 px-3 rounded-xl"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
              >
                <Mail size={16} style={{ color: "var(--text-dim)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="flex-1 py-3 bg-transparent text-sm outline-none"
                  style={{ color: "var(--text)" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>
                Password
              </label>
              <div
                className="flex items-center gap-2 px-3 rounded-xl"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
              >
                <Lock size={16} style={{ color: "var(--text-dim)" }} />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="flex-1 py-3 bg-transparent text-sm outline-none"
                  style={{ color: "var(--text)" }}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)}>
                  {showPw ? <EyeOff size={16} style={{ color: "var(--text-dim)" }} /> : <Eye size={16} style={{ color: "var(--text-dim)" }} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Sign In
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/auth/sign-up" className="font-bold" style={{ color: "var(--primary)" }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
