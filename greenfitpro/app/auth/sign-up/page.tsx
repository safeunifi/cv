"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ background: "var(--background)" }}>
        <div className="w-full max-w-sm text-center space-y-4">
          <span className="text-5xl">✉️</span>
          <h2 className="text-2xl font-black" style={{ color: "var(--text)" }}>Check your email</h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            We sent a confirmation link to <strong style={{ color: "var(--text)" }}>{email}</strong>. Click it to activate your account.
          </p>
          <Link href="/auth/sign-in" className="block text-sm font-bold" style={{ color: "var(--primary)" }}>
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10" style={{ background: "var(--background)" }}>
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <span className="text-5xl">⛳</span>
          <h1 className="text-2xl font-black mt-2" style={{ color: "var(--text)" }}>Create Account</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Start your golf performance journey</p>
        </div>

        <Card className="p-5">
          <form onSubmit={signUp} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>Full Name</label>
              <div className="flex items-center gap-2 px-3 rounded-xl" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                <User size={16} style={{ color: "var(--text-dim)" }} />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tiger Woods" required className="flex-1 py-3 bg-transparent text-sm outline-none" style={{ color: "var(--text)" }} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>Email</label>
              <div className="flex items-center gap-2 px-3 rounded-xl" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                <Mail size={16} style={{ color: "var(--text-dim)" }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className="flex-1 py-3 bg-transparent text-sm outline-none" style={{ color: "var(--text)" }} />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1" style={{ color: "var(--text-muted)" }}>Password</label>
              <div className="flex items-center gap-2 px-3 rounded-xl" style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}>
                <Lock size={16} style={{ color: "var(--text-dim)" }} />
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required className="flex-1 py-3 bg-transparent text-sm outline-none" style={{ color: "var(--text)" }} />
                <button type="button" onClick={() => setShowPw((v) => !v)}>
                  {showPw ? <EyeOff size={16} style={{ color: "var(--text-dim)" }} /> : <Eye size={16} style={{ color: "var(--text-dim)" }} />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              Create Account
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <Link href="/auth/sign-in" className="font-bold" style={{ color: "var(--primary)" }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
