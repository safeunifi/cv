import Link from "next/link";
import { Activity, Dumbbell, Apple, Camera, TrendingUp, Zap } from "lucide-react";
import { Card } from "@/components/ui/Card";

const features = [
  {
    href: "/golf",
    icon: Activity,
    color: "#22c55e",
    label: "Swing Analyzer",
    desc: "Record & analyze your golf swing with AI pose detection",
    badge: "AI",
  },
  {
    href: "/fitness",
    icon: Dumbbell,
    color: "#84cc16",
    label: "Fitness & Mobility",
    desc: "Golf-specific strength and mobility workout plans",
    badge: null,
  },
  {
    href: "/nutrition",
    icon: Apple,
    color: "#f59e0b",
    label: "Nutrition",
    desc: "Track macros and fuel your round the right way",
    badge: null,
  },
  {
    href: "/nutrition/scanner",
    icon: Camera,
    color: "#3b82f6",
    label: "Meal Scanner",
    desc: "Snap a photo of any meal — get a healthier version with macros",
    badge: "AI",
  },
];

const stats = [
  { label: "Swings Analyzed", value: "—", icon: Activity },
  { label: "Workouts Done", value: "—", icon: TrendingUp },
  { label: "Avg Score", value: "—", icon: Zap },
];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Hero */}
      <div
        className="px-5 pt-12 pb-8"
        style={{
          background: "linear-gradient(180deg, #0d2010 0%, var(--background) 100%)",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">⛳</span>
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--primary)" }}>
            GreenFit Pro
          </span>
        </div>
        <h1 className="text-3xl font-black leading-tight" style={{ color: "var(--text)" }}>
          Play Better.<br />
          <span style={{ color: "var(--primary)" }}>Train Smarter.</span>
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>
          Your all-in-one golf performance platform
        </p>
      </div>

      {/* Quick Stats */}
      <div className="px-4 mb-5">
        <div className="grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="p-3 text-center">
              <Icon size={16} className="mx-auto mb-1" style={{ color: "var(--primary)" }} />
              <div className="text-xl font-black" style={{ color: "var(--text)" }}>{value}</div>
              <div className="text-xs leading-tight mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Feature Grid */}
      <div className="px-4 space-y-3 pb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider px-1" style={{ color: "var(--text-muted)" }}>
          Features
        </h2>
        {features.map(({ href, icon: Icon, color, label, desc, badge }) => (
          <Link key={href} href={href}>
            <Card
              className="p-4 flex items-center gap-4 transition-transform"
              variant="default"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: `${color}22` }}
              >
                <Icon size={24} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base" style={{ color: "var(--text)" }}>{label}</span>
                  {badge && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{ background: `${color}33`, color }}
                    >
                      {badge}
                    </span>
                  )}
                </div>
                <p className="text-sm mt-0.5 leading-snug" style={{ color: "var(--text-muted)" }}>
                  {desc}
                </p>
              </div>
              <span style={{ color: "var(--text-dim)" }}>›</span>
            </Card>
          </Link>
        ))}
      </div>

      {/* Tip of the day */}
      <div className="px-4 pb-4">
        <Card variant="outline" className="p-4">
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--primary)" }}>
            💡 Pro Tip
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Record your swing from two angles — face-on and down the line — for the most comprehensive analysis.
          </p>
        </Card>
      </div>
    </div>
  );
}
