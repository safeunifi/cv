import Link from "next/link";
import { Video, BookOpen, BarChart2, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import PageHeader from "@/components/layout/PageHeader";

const actions = [
  {
    href: "/golf/capture",
    icon: Video,
    color: "#22c55e",
    label: "Record Swing",
    desc: "Capture and analyze your swing with pose detection",
  },
  {
    href: "/golf/drills",
    icon: BookOpen,
    color: "#84cc16",
    label: "Drill Library",
    desc: "Browse 40+ golf-specific improvement drills",
  },
  {
    href: "/golf/history",
    icon: BarChart2,
    color: "#3b82f6",
    label: "Swing History",
    desc: "Track progress and review past analyses",
  },
];

const tips = [
  { phase: "Address", tip: "Spine angle 25–35° forward tilt. Athletic knee flex." },
  { phase: "Top", tip: "90° shoulder turn, 45° hip turn = 45° X-Factor." },
  { phase: "Impact", tip: "Maintain spine angle. Weight forward. Hands ahead." },
  { phase: "Finish", tip: "Full rotation. Belt buckle faces target. Balanced." },
];

export default function GolfPage() {
  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <PageHeader
        title="Swing Analyzer"
        subtitle="AI-powered swing analysis"
      />

      <div className="px-4 pt-4 space-y-4 pb-6">
        {/* Main actions */}
        <div className="space-y-3">
          {actions.map(({ href, icon: Icon, color, label, desc }) => (
            <Link key={href} href={href}>
              <Card className="p-4 flex items-center gap-4">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}22` }}
                >
                  <Icon size={22} style={{ color }} />
                </div>
                <div className="flex-1">
                  <div className="font-bold" style={{ color: "var(--text)" }}>{label}</div>
                  <div className="text-sm" style={{ color: "var(--text-muted)" }}>{desc}</div>
                </div>
                <ChevronRight size={18} style={{ color: "var(--text-dim)" }} />
              </Card>
            </Link>
          ))}
        </div>

        {/* Camera positioning guide */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--text-muted)" }}>
            Setup Guide
          </h2>
          <Card className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div
                className="p-3 rounded-xl"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-bold mb-1" style={{ color: "var(--primary)" }}>Face-On</p>
                <p className="text-xs leading-snug" style={{ color: "var(--text-muted)" }}>
                  Camera perpendicular to target. Waist height. ~10 ft away.
                </p>
              </div>
              <div
                className="p-3 rounded-xl"
                style={{ background: "var(--surface2)", border: "1px solid var(--border)" }}
              >
                <p className="text-xs font-bold mb-1" style={{ color: "var(--accent)" }}>Down the Line</p>
                <p className="text-xs leading-snug" style={{ color: "var(--text-muted)" }}>
                  Camera behind you along target line. Hand height. ~10 ft back.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Key positions reference */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--text-muted)" }}>
            Key Positions
          </h2>
          <div className="space-y-2">
            {tips.map(({ phase, tip }) => (
              <Card key={phase} className="p-3 flex gap-3 items-start">
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5"
                  style={{ background: "var(--primary-dim)", color: "var(--primary)" }}
                >
                  {phase}
                </span>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{tip}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
