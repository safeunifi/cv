"use client";

import { Calendar, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import PageHeader from "@/components/layout/PageHeader";
import Link from "next/link";

const LOG_DAYS = [
  { date: "Today, Apr 20", calories: 1640, protein: 112, carbs: 185, fat: 52, score: 88 },
  { date: "Yesterday, Apr 19", calories: 2080, protein: 148, carbs: 225, fat: 65, score: 92 },
  { date: "Apr 18", calories: 1920, protein: 134, carbs: 210, fat: 58, score: 85 },
  { date: "Apr 17", calories: 2350, protein: 120, carbs: 285, fat: 82, score: 71 },
  { date: "Apr 16", calories: 1780, protein: 158, carbs: 195, fat: 48, score: 94 },
];

const scoreColor = (s: number) => s >= 85 ? "var(--primary)" : s >= 70 ? "var(--warning)" : "var(--danger)";

export default function FoodLogPage() {
  const weekAvgCals = Math.round(LOG_DAYS.reduce((a, d) => a + d.calories, 0) / LOG_DAYS.length);
  const weekAvgProtein = Math.round(LOG_DAYS.reduce((a, d) => a + d.protein, 0) / LOG_DAYS.length);

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <PageHeader title="Food Log" subtitle="7-day history" back />

      <div className="px-4 pt-4 space-y-5 pb-6">
        {/* Week summary */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <div className="text-2xl font-black" style={{ color: "var(--primary)" }}>{weekAvgCals}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Avg Daily kcal</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-black" style={{ color: "#22c55e" }}>{weekAvgProtein}g</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Avg Daily Protein</div>
          </Card>
        </div>

        {/* Daily entries */}
        <div className="space-y-2">
          {LOG_DAYS.map((day) => (
            <Link key={day.date} href="/nutrition/macros">
              <Card className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${scoreColor(day.score)}22` }}>
                  <Calendar size={18} style={{ color: scoreColor(day.score) }} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm" style={{ color: "var(--text)" }}>{day.date}</p>
                  <div className="flex gap-3 mt-0.5">
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>{day.calories} kcal</span>
                    <span className="text-xs" style={{ color: "#22c55e" }}>P: {day.protein}g</span>
                    <span className="text-xs" style={{ color: "#f59e0b" }}>C: {day.carbs}g</span>
                    <span className="text-xs" style={{ color: "#3b82f6" }}>F: {day.fat}g</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black" style={{ color: scoreColor(day.score) }}>{day.score}</span>
                  <ChevronRight size={16} style={{ color: "var(--text-dim)" }} />
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <Card variant="outline" className="p-4">
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--primary)" }}>Goal Tip</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Aim for 0.8–1.0g of protein per pound of body weight daily to support muscle recovery and strength gains from your golf fitness program.
          </p>
        </Card>
      </div>
    </div>
  );
}
