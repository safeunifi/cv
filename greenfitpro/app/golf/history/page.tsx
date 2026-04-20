"use client";

import { BarChart2, Video, Calendar } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/layout/PageHeader";
import { useRouter } from "next/navigation";

const DEMO_HISTORY = [
  { id: "1", date: "Apr 18, 2026", club: "Driver", angle: "faceOn", score: 68, faults: 3 },
  { id: "2", date: "Apr 15, 2026", club: "7 Iron", angle: "dtl", score: 72, faults: 2 },
  { id: "3", date: "Apr 12, 2026", club: "9 Iron", angle: "faceOn", score: 76, faults: 2 },
  { id: "4", date: "Apr 8, 2026", club: "Driver", angle: "faceOn", score: 65, faults: 4 },
];

const scoreColor = (s: number) =>
  s >= 80 ? "var(--primary)" : s >= 65 ? "var(--warning)" : "var(--danger)";

export default function HistoryPage() {
  const router = useRouter();

  const avg = Math.round(DEMO_HISTORY.reduce((a, b) => a + b.score, 0) / DEMO_HISTORY.length);
  const best = Math.max(...DEMO_HISTORY.map((h) => h.score));

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <PageHeader title="Swing History" back />

      <div className="px-4 pt-4 space-y-5 pb-6">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Sessions", value: DEMO_HISTORY.length },
            { label: "Avg Score", value: avg },
            { label: "Best Score", value: best },
          ].map(({ label, value }) => (
            <Card key={label} className="p-3 text-center">
              <div className="text-2xl font-black" style={{ color: "var(--primary)" }}>{value}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
            </Card>
          ))}
        </div>

        {/* Progress trend */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={18} style={{ color: "var(--primary)" }} />
            <span className="font-bold" style={{ color: "var(--text)" }}>Score Trend</span>
          </div>
          <div className="flex items-end gap-2 h-24">
            {[...DEMO_HISTORY].reverse().map((h, i) => (
              <div key={h.id} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-bold" style={{ color: scoreColor(h.score) }}>{h.score}</span>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${(h.score / 100) * 80}px`,
                    background: scoreColor(h.score),
                    opacity: 0.8,
                  }}
                />
                <span className="text-xs" style={{ color: "var(--text-dim)" }}>S{i + 1}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Sessions list */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--text-muted)" }}>
            Recent Sessions
          </h2>
          <div className="space-y-2">
            {DEMO_HISTORY.map((h) => (
              <Card key={h.id} className="p-4 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${scoreColor(h.score)}22` }}
                >
                  <Video size={18} style={{ color: scoreColor(h.score) }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold" style={{ color: "var(--text)" }}>{h.club}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--surface2)", color: "var(--text-muted)" }}>
                      {h.angle === "faceOn" ? "Face On" : "DTL"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Calendar size={12} style={{ color: "var(--text-dim)" }} />
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{h.date}</span>
                    <span className="text-xs" style={{ color: "var(--text-dim)" }}>· {h.faults} fault{h.faults !== 1 ? "s" : ""}</span>
                  </div>
                </div>
                <div
                  className="text-xl font-black"
                  style={{ color: scoreColor(h.score) }}
                >
                  {h.score}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Button variant="primary" fullWidth size="lg" onClick={() => router.push("/golf/capture")}>
          Record New Swing
        </Button>
      </div>
    </div>
  );
}
