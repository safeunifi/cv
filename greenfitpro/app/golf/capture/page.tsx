"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Video, StopCircle, FlipHorizontal, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import PageHeader from "@/components/layout/PageHeader";
import type { CameraAngle, ClubType } from "@/types/golf";
import { ALL_CLUBS } from "@/types/golf";

export default function CapturePage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [permission, setPermission] = useState<"idle" | "granted" | "denied">("idle");
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [angle, setAngle] = useState<CameraAngle>("faceOn");
  const [club, setClub] = useState<ClubType>("7 Iron");
  const [showClubPicker, setShowClubPicker] = useState(false);

  const startCamera = useCallback(async (mode: "user" | "environment") => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermission("granted");
    } catch {
      setPermission("denied");
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [facingMode, startCamera]);

  const flipCamera = () => {
    setFacingMode((m) => (m === "environment" ? "user" : "environment"));
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    setCountdown(3);
    const tick = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(tick);
          beginRecord();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const beginRecord = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(streamRef.current, { mimeType: "video/webm;codecs=vp8" });
    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      sessionStorage.setItem(
        "pendingSwing",
        JSON.stringify({ videoUrl: url, angle, club, duration: elapsed }),
      );
      router.push("/golf/results");
    };
    mr.start(100);
    mediaRecorderRef.current = mr;
    setRecording(true);
    setElapsed(0);
  };

  useEffect(() => {
    if (!recording) return;
    const iv = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(iv);
  }, [recording]);

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div style={{ background: "#000", minHeight: "100vh", position: "relative" }}>
      <PageHeader title="Record Swing" back />

      {/* Camera view */}
      <div className="relative" style={{ aspectRatio: "9/16", maxHeight: "65vh", overflow: "hidden", background: "#111" }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
        />

        {/* Angle overlay guide */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ border: "2px solid rgba(34,197,94,0.3)", margin: 20, borderRadius: 12 }}
        />

        {/* Countdown overlay */}
        {countdown > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-8xl font-black"
              style={{ color: "var(--primary)", textShadow: "0 0 40px rgba(34,197,94,0.8)" }}
            >
              {countdown}
            </span>
          </div>
        )}

        {/* Recording indicator */}
        {recording && (
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: "rgba(0,0,0,0.7)" }}>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-sm font-mono font-bold">{fmt(elapsed)}</span>
          </div>
        )}

        {/* Flip button */}
        <button
          onClick={flipCamera}
          className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <FlipHorizontal size={20} className="text-white" />
        </button>

        {/* Denied */}
        {permission === "denied" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center px-8">
            <X size={48} style={{ color: "var(--danger)" }} />
            <p className="text-white font-bold">Camera access denied</p>
            <p className="text-sm text-gray-400">Please allow camera access in your browser settings</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-4 pt-4 space-y-4" style={{ background: "var(--background)" }}>
        {/* Angle + Club selector */}
        {!recording && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: "var(--text-muted)" }}>
                Camera Angle
              </label>
              <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                {(["faceOn", "dtl"] as CameraAngle[]).map((a) => (
                  <button
                    key={a}
                    onClick={() => setAngle(a)}
                    className="flex-1 py-2 text-xs font-bold transition-all"
                    style={{
                      background: angle === a ? "var(--primary)" : "var(--surface)",
                      color: angle === a ? "#000" : "var(--text-muted)",
                    }}
                  >
                    {a === "faceOn" ? "Face On" : "DTL"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-1 block" style={{ color: "var(--text-muted)" }}>
                Club
              </label>
              <button
                onClick={() => setShowClubPicker((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-bold"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
              >
                {club}
                <ChevronDown size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Club picker dropdown */}
        {showClubPicker && (
          <Card className="p-2 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-3 gap-1">
              {ALL_CLUBS.map((c) => (
                <button
                  key={c}
                  onClick={() => { setClub(c); setShowClubPicker(false); }}
                  className="py-2 px-1 text-xs font-medium rounded-lg transition-all"
                  style={{
                    background: club === c ? "var(--primary)" : "var(--surface2)",
                    color: club === c ? "#000" : "var(--text-muted)",
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Record button */}
        <Button
          variant={recording ? "danger" : "primary"}
          size="lg"
          fullWidth
          onClick={recording ? stopRecording : startRecording}
          disabled={permission !== "granted" || countdown > 0}
        >
          {recording ? (
            <>
              <StopCircle size={22} />
              Stop Recording
            </>
          ) : (
            <>
              <Video size={22} />
              {countdown > 0 ? `Starting in ${countdown}…` : "Start Recording"}
            </>
          )}
        </Button>

        <p className="text-center text-xs pb-2" style={{ color: "var(--text-dim)" }}>
          Record 3–5 seconds per swing for best results
        </p>
      </div>
    </div>
  );
}
