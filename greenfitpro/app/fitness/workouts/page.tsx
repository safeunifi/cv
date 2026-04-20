"use client";

import { useState } from "react";
import { Dumbbell, Clock, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/layout/PageHeader";

const PLANS = [
  {
    id: "beginner_3day",
    name: "Golf Foundation",
    level: "Beginner",
    daysPerWeek: 3,
    weeks: 8,
    focus: "Build the athletic base for a powerful swing",
    color: "#22c55e",
    days: [
      {
        name: "Day 1 — Lower Body & Core",
        exercises: [
          { name: "Goblet Squat", sets: "3", reps: "12", rest: "90s" },
          { name: "Romanian Deadlift", sets: "3", reps: "10", rest: "90s" },
          { name: "Dead Bug", sets: "3", reps: "10/side", rest: "60s" },
          { name: "Pallof Press", sets: "3", reps: "12/side", rest: "60s" },
          { name: "Hip 90/90 Stretch", sets: "2", reps: "60s/side", rest: "30s" },
        ],
      },
      {
        name: "Day 2 — Upper Body & Rotation",
        exercises: [
          { name: "Seated Cable Row", sets: "3", reps: "12", rest: "75s" },
          { name: "Dumbbell Press", sets: "3", reps: "10", rest: "90s" },
          { name: "Med Ball Rotational Throw", sets: "3", reps: "8/side", rest: "90s" },
          { name: "Face Pulls", sets: "3", reps: "15", rest: "60s" },
          { name: "Thoracic Rotation", sets: "2", reps: "10/side", rest: "30s" },
        ],
      },
      {
        name: "Day 3 — Full Body Power",
        exercises: [
          { name: "Box Jump", sets: "3", reps: "5", rest: "2min" },
          { name: "Single Leg RDL", sets: "3", reps: "8/side", rest: "75s" },
          { name: "Pallof Press", sets: "3", reps: "12/side", rest: "60s" },
          { name: "Hip Flexor Stretch", sets: "2", reps: "60s/side", rest: "30s" },
        ],
      },
    ],
  },
  {
    id: "intermediate_4day",
    name: "Power & Distance",
    level: "Intermediate",
    daysPerWeek: 4,
    weeks: 10,
    focus: "Develop rotational power and clubhead speed",
    color: "#f59e0b",
    days: [
      {
        name: "Day 1 — Lower Body Strength",
        exercises: [
          { name: "Back Squat", sets: "4", reps: "6–8", rest: "2min" },
          { name: "Romanian Deadlift", sets: "4", reps: "8", rest: "2min" },
          { name: "Single Leg RDL", sets: "3", reps: "8/side", rest: "90s" },
          { name: "Hip 90/90 Stretch", sets: "3", reps: "60s/side", rest: "30s" },
        ],
      },
      {
        name: "Day 2 — Upper Body & Rotation",
        exercises: [
          { name: "Cable Row", sets: "4", reps: "10", rest: "90s" },
          { name: "Med Ball Rotational Throw", sets: "4", reps: "8/side", rest: "90s" },
          { name: "Landmine Rotation", sets: "3", reps: "10/side", rest: "90s" },
          { name: "Face Pulls", sets: "3", reps: "15", rest: "60s" },
        ],
      },
      {
        name: "Day 3 — Power Development",
        exercises: [
          { name: "Box Jump", sets: "4", reps: "5", rest: "2min" },
          { name: "Med Ball Slam", sets: "4", reps: "8", rest: "90s" },
          { name: "Trap Bar Deadlift", sets: "3", reps: "5", rest: "3min" },
          { name: "Pallof Press", sets: "3", reps: "10/side", rest: "60s" },
        ],
      },
      {
        name: "Day 4 — Mobility & Stability",
        exercises: [
          { name: "Thoracic Rotation", sets: "3", reps: "10/side", rest: "30s" },
          { name: "Hip 90/90", sets: "3", reps: "60s/side", rest: "30s" },
          { name: "Dead Bug", sets: "3", reps: "10/side", rest: "60s" },
          { name: "Scorpion Stretch", sets: "2", reps: "8/side", rest: "30s" },
        ],
      },
    ],
  },
];

export default function WorkoutsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState<Record<string, number>>({});

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <PageHeader title="Workout Plans" subtitle="Golf performance programs" back />

      <div className="px-4 pt-4 space-y-5 pb-6">
        {PLANS.map((plan) => {
          const isOpen = expanded === plan.id;
          const dayIdx = activeDay[plan.id] ?? 0;

          return (
            <Card key={plan.id} variant="default">
              <button
                className="w-full p-4 text-left"
                onClick={() => setExpanded(isOpen ? null : plan.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-black text-lg" style={{ color: "var(--text)" }}>{plan.name}</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${plan.color}22`, color: plan.color }}>
                        {plan.level}
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                        <Calendar size={11} /> {plan.daysPerWeek}d/week
                      </span>
                      <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-muted)" }}>
                        <Clock size={11} /> {plan.weeks} weeks
                      </span>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp size={18} style={{ color: "var(--text-dim)" }} /> : <ChevronDown size={18} style={{ color: "var(--text-dim)" }} />}
                </div>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{plan.focus}</p>
              </button>

              {isOpen && (
                <div className="border-t animate-fade-in" style={{ borderColor: "var(--border)" }}>
                  {/* Day tabs */}
                  <div className="flex overflow-x-auto p-3 gap-2">
                    {plan.days.map((day, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveDay((prev) => ({ ...prev, [plan.id]: i }))}
                        className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background: dayIdx === i ? plan.color : "var(--surface2)",
                          color: dayIdx === i ? "#000" : "var(--text-muted)",
                        }}
                      >
                        Day {i + 1}
                      </button>
                    ))}
                  </div>

                  {/* Day details */}
                  <div className="px-4 pb-4">
                    <p className="text-xs font-bold mb-3" style={{ color: "var(--text-muted)" }}>
                      {plan.days[dayIdx].name}
                    </p>
                    <div className="space-y-2">
                      {plan.days[dayIdx].exercises.map((ex, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-xl"
                          style={{ background: "var(--surface2)" }}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                              style={{ background: `${plan.color}22`, color: plan.color }}
                            >
                              {i + 1}
                            </span>
                            <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{ex.name}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold" style={{ color: plan.color }}>{ex.sets} × {ex.reps}</span>
                            <div className="text-xs" style={{ color: "var(--text-dim)" }}>Rest {ex.rest}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button variant="primary" size="md" fullWidth className="mt-4">
                      <Dumbbell size={16} />
                      Start Workout
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
