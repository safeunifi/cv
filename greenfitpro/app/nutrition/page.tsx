import Link from "next/link";
import { Camera, BarChart2, BookOpen, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { MacroCircle } from "@/components/ui/MacroBar";
import PageHeader from "@/components/layout/PageHeader";

const sections = [
  {
    href: "/nutrition/scanner",
    icon: Camera,
    color: "#3b82f6",
    label: "Meal Scanner",
    desc: "Snap a photo → get healthier version + macros",
    badge: "AI",
  },
  {
    href: "/nutrition/macros",
    icon: BarChart2,
    color: "#22c55e",
    label: "Macro Tracker",
    desc: "Track daily protein, carbs, fat, and calories",
  },
  {
    href: "/nutrition/log",
    icon: BookOpen,
    color: "#f59e0b",
    label: "Food Log",
    desc: "Log meals and review your nutrition history",
  },
];

// Demo daily summary
const todayMacros = { calories: 1640, protein: 112, carbs: 185, fat: 52 };
const goals = { calories: 2200, protein: 165, carbs: 240, fat: 70 };

export default function NutritionPage() {
  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <PageHeader title="Nutrition" subtitle="Fuel your performance" />

      <div className="px-4 pt-4 space-y-5 pb-6">
        {/* Today summary */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold" style={{ color: "var(--text)" }}>Today</span>
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              {todayMacros.calories} / {goals.calories} kcal
            </span>
          </div>

          {/* Calorie progress bar */}
          <div className="mb-5">
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, (todayMacros.calories / goals.calories) * 100)}%`,
                  background: "linear-gradient(90deg, var(--primary), var(--accent))",
                  transition: "width 0.8s ease",
                }}
              />
            </div>
          </div>

          {/* Macro circles */}
          <div className="grid grid-cols-3 gap-3">
            <MacroCircle label="Protein" value={todayMacros.protein} color="#22c55e" />
            <MacroCircle label="Carbs" value={todayMacros.carbs} color="#f59e0b" />
            <MacroCircle label="Fat" value={todayMacros.fat} color="#3b82f6" />
          </div>

          <div className="mt-3 pt-3 border-t text-center" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {goals.calories - todayMacros.calories} kcal remaining today
            </span>
          </div>
        </Card>

        {/* Sections */}
        <div className="space-y-3">
          {sections.map(({ href, icon: Icon, color, label, desc, badge }) => (
            <Link key={href} href={href}>
              <Card className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}22` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold" style={{ color: "var(--text)" }}>{label}</span>
                    {badge && (
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ background: `${color}33`, color }}>
                        {badge}
                      </span>
                    )}
                  </div>
                  <div className="text-sm" style={{ color: "var(--text-muted)" }}>{desc}</div>
                </div>
                <ChevronRight size={18} style={{ color: "var(--text-dim)" }} />
              </Card>
            </Link>
          ))}
        </div>

        {/* Golf nutrition tip */}
        <Card variant="outline" className="p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--primary)" }}>
            ⛳ Golf Nutrition Tip
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Eat a mixed meal (carbs + protein) 2–3 hours before your round. During the round, aim for 30–60g of carbs per hour and stay hydrated — even mild dehydration affects focus and club selection.
          </p>
        </Card>
      </div>
    </div>
  );
}
