"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertTriangle, XCircle, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScoreRing } from "@/components/ui/ScoreRing";
import PageHeader from "@/components/layout/PageHeader";

interface FaultItem {
  name: string;
  severity: "Major" | "Moderate" | "Minor";
  description: string;
  correction: string;
}

interface SwingResult {
  overallScore: number;
  videoUrl?: string;
  angle: string;
  club: string;
  faults: FaultItem[];
  strengths: string[];
  tempo?: { ratio: number; backswingDuration: number; downswingDuration: number };
  phases?: Record<string, { score: number; observations: string[] }>;
}

const DEMO: SwingResult = {
  overallScore: 72,
  angle: "faceOn",
  club: "7 Iron",
  faults: [
    {
      name: "Early Extension",
      severity: "Major",
      description: "Losing 15° of spine angle through impact. Body is standing up too early.",
      correction: "Focus on maintaining your spine angle throughout the downswing. Feel like your chest stays over the ball.",
    },
    {
      name: "Restricted Turn",
      severity: "Moderate",
      description: "Shoulder turn of only 78° (ideal: 85–100°). This limits power and consistency.",
      correction: "Focus on turning your lead shoulder behind the ball. Flexibility exercises can help.",
    },
  ],
  strengths: [
    "Good athletic posture at address",
    "Solid lead arm extension at the top",
    "Strong impact position",
  ],
  tempo: { ratio: 3.1, backswingDuration: 0.93, downswingDuration: 0.30 },
  phases: {
    address: { score: 82, observations: ["Good spine tilt", "Athletic knee flex"] },
    topOfBackswing: { score: 68, observations: ["Shoulder turn slightly restricted"] },
    impact: { score: 74, observations: ["Early extension detected"] },
    finish: { score: 80, observations: ["Good follow-through rotation"] },
  },
};

const severityConfig = {
  Major: { color: "var(--danger)", icon: XCircle, bg: "#ef444422" },
  Moderate: { color: "var(--warning)", icon: AlertTriangle, bg: "#f59e0b22" },
  Minor: { color: "var(--info)", icon: AlertTriangle, bg: "#3b82f622" },
};

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<SwingResult>(DEMO);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");

  useEffect(() => {
    const raw = sessionStorage.getItem("pendingSwing");
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.videoUrl) setVideoUrl(data.videoUrl);
        // In a real app, video would be sent for server-side pose analysis
        // For now we show demo results with actual video playback
        setResult((r) => ({ ...r, angle: data.angle, club: data.club }));
      } catch {}
    }
  }, []);

  const tempoLabel = (ratio: number) => {
    if (ratio >= 2.5 && ratio <= 3.5) return "Excellent (3:1)";
    if (ratio < 2.5) return "Too quick";
    return "Slightly slow";
  };

  const phaseColor = (score: number) =>
    score >= 80 ? "var(--primary)" : score >= 60 ? "var(--warning)" : "var(--danger)";

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <PageHeader
        title="Swing Analysis"
        subtitle={`${result.club} · ${result.angle === "faceOn" ? "Face On" : "Down the Line"}`}
        back
      />

      <div className="px-4 pt-4 space-y-5 pb-6">
        {/* Video replay */}
        {videoUrl && (
          <Card className="overflow-hidden">
            <video
              src={videoUrl}
              controls
              playsInline
              className="w-full"
              style={{ maxHeight: 280, background: "#000" }}
            />
          </Card>
        )}

        {/* Score */}
        <Card className="p-5 flex flex-col items-center gap-3">
          <ScoreRing score={result.overallScore} size={140} label={
            result.overallScore >= 90 ? "Excellent" :
            result.overallScore >= 80 ? "Very Good" :
            result.overallScore >= 70 ? "Good" :
            result.overallScore >= 60 ? "Fair" : "Needs Work"
          } />
          <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
            Overall swing score based on posture, rotation, and tempo
          </p>
        </Card>

        {/* Tempo */}
        {result.tempo && (
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} style={{ color: "var(--accent)" }} />
              <span className="font-bold" style={{ color: "var(--text)" }}>Swing Tempo</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-xl font-black" style={{ color: "var(--primary)" }}>
                  {result.tempo.ratio.toFixed(1)}:1
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Ratio</div>
              </div>
              <div>
                <div className="text-xl font-black" style={{ color: "var(--accent)" }}>
                  {(result.tempo.backswingDuration * 1000).toFixed(0)}ms
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Backswing</div>
              </div>
              <div>
                <div className="text-xl font-black" style={{ color: "var(--warning)" }}>
                  {(result.tempo.downswingDuration * 1000).toFixed(0)}ms
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>Downswing</div>
              </div>
            </div>
            <p className="text-xs mt-2 text-center" style={{ color: "var(--text-muted)" }}>
              {tempoLabel(result.tempo.ratio)} — Tour average is 3:1
            </p>
          </Card>
        )}

        {/* Phase breakdown */}
        {result.phases && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--text-muted)" }}>
              Phase Breakdown
            </h2>
            <div className="space-y-2">
              {Object.entries(result.phases).map(([phase, data]) => (
                <Card key={phase} className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium capitalize" style={{ color: "var(--text)" }}>
                      {phase.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-sm font-bold" style={{ color: phaseColor(data.score) }}>
                      {data.score}/100
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${data.score}%`, background: phaseColor(data.score), transition: "width 0.8s ease" }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Faults */}
        {result.faults.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--text-muted)" }}>
              Faults to Fix ({result.faults.length})
            </h2>
            <div className="space-y-2">
              {result.faults.map((fault) => {
                const cfg = severityConfig[fault.severity];
                const Icon = cfg.icon;
                const isOpen = expanded === fault.name;
                return (
                  <Card key={fault.name} style={{ borderColor: cfg.color + "55" }}>
                    <button
                      className="w-full p-4 flex items-center gap-3 text-left"
                      onClick={() => setExpanded(isOpen ? null : fault.name)}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                        <Icon size={18} style={{ color: cfg.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold" style={{ color: "var(--text)" }}>{fault.name}</div>
                        <div className="text-xs font-medium" style={{ color: cfg.color }}>{fault.severity} Fault</div>
                      </div>
                      {isOpen ? <ChevronUp size={16} style={{ color: "var(--text-dim)" }} /> : <ChevronDown size={16} style={{ color: "var(--text-dim)" }} />}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 space-y-2 animate-fade-in">
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{fault.description}</p>
                        <div className="p-3 rounded-xl" style={{ background: "var(--surface2)" }}>
                          <p className="text-xs font-bold mb-1" style={{ color: "var(--primary)" }}>Fix:</p>
                          <p className="text-sm" style={{ color: "var(--text)" }}>{fault.correction}</p>
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Strengths */}
        {result.strengths.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--text-muted)" }}>
              Strengths
            </h2>
            <Card className="p-4 space-y-2">
              {result.strengths.map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <CheckCircle size={16} className="shrink-0" style={{ color: "var(--primary)" }} />
                  <span className="text-sm" style={{ color: "var(--text)" }}>{s}</span>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* CTA */}
        <Button variant="secondary" size="lg" fullWidth onClick={() => router.push("/golf/drills")}>
          View Recommended Drills
        </Button>
        <Button variant="primary" size="lg" fullWidth onClick={() => router.push("/golf/capture")}>
          Record Another Swing
        </Button>
      </div>
    </div>
  );
}
