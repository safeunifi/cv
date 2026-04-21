import Link from "next/link";
import { Dumbbell, Zap, Timer, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import PageHeader from "@/components/layout/PageHeader";

const sections = [
  {
    href: "/fitness/workouts",
    icon: Dumbbell,
    color: "#22c55e",
    label: "Workout Plans",
    desc: "Golf-specific strength and power programs",
  },
  {
    href: "/fitness/exercises",
    icon: Zap,
    color: "#84cc16",
    label: "Exercise Library",
    desc: "Browse all exercises with instructions",
  },
  {
    href: "/fitness/mobility",
    icon: Timer,
    color: "#3b82f6",
    label: "Mobility Routines",
    desc: "Pre-round, post-round, and flexibility routines",
  },
];

const focusAreas = [
  { label: "Rotational Power", desc: "Drive distance", color: "#22c55e" },
  { label: "Hip Mobility", desc: "Backswing depth", color: "#84cc16" },
  { label: "Core Stability", desc: "Consistent impact", color: "#f59e0b" },
  { label: "Lower Body", desc: "Power transfer", color: "#3b82f6" },
];

export default function FitnessPage() {
  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <PageHeader title="Fitness & Mobility" subtitle="Train for golf performance" />

      <div className="px-4 pt-4 space-y-5 pb-6">
        {/* Main sections */}
        <div className="space-y-3">
          {sections.map(({ href, icon: Icon, color, label, desc }) => (
            <Link key={href} href={href}>
              <Card className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}22` }}>
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

        {/* Today's quick workout */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: "var(--text-muted)" }}>
            Golf Fitness Focus Areas
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {focusAreas.map(({ label, desc, color }) => (
              <Card key={label} className="p-4">
                <div className="w-2 h-2 rounded-full mb-2" style={{ background: color }} />
                <div className="font-bold text-sm" style={{ color: "var(--text)" }}>{label}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{desc}</div>
              </Card>
            ))}
          </div>
        </div>

        {/* TPI section */}
        <Card variant="outline" className="p-4">
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--primary)" }}>
            TPI-Informed Training
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            All exercises are selected based on Titleist Performance Institute principles — targeting the physical attributes most linked to an efficient, powerful golf swing.
          </p>
        </Card>
      </div>
    </div>
  );
}
