"use client";

import { useState } from "react";
import { Timer, Play, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PageHeader from "@/components/layout/PageHeader";
import { MOBILITY_ROUTINES } from "@/lib/exercises";

const routineColors = ["#22c55e", "#3b82f6", "#f59e0b"];

export default function MobilityPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <PageHeader title="Mobility Routines" subtitle="Flexibility for golf" back />

      <div className="px-4 pt-4 space-y-4 pb-6">
        <Card variant="outline" className="p-4">
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--primary)" }}>
            Why Mobility Matters
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            90% of amateur golfers have at least one physical limitation affecting their swing. Better mobility = bigger shoulder turn = more distance and consistency.
          </p>
        </Card>

        {MOBILITY_ROUTINES.map((routine, idx) => {
          const color = routineColors[idx % routineColors.length];
          const isOpen = expanded === routine.id;

          return (
            <Card key={routine.id}>
              <button
                className="w-full p-4 text-left"
                onClick={() => setExpanded(isOpen ? null : routine.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}22` }}>
                      <Timer size={20} style={{ color }} />
                    </div>
                    <div>
                      <div className="font-bold" style={{ color: "var(--text)" }}>{routine.name}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}22`, color }}>
                          {routine.duration}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{routine.target}</span>
                      </div>
                    </div>
                  </div>
                  {isOpen ? <ChevronUp size={18} style={{ color: "var(--text-dim)" }} /> : <ChevronDown size={18} style={{ color: "var(--text-dim)" }} />}
                </div>
              </button>

              {isOpen && (
                <div className="border-t animate-fade-in" style={{ borderColor: "var(--border)" }}>
                  <div className="px-4 py-4 space-y-2">
                    {routine.exercises.map((ex, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-xl"
                        style={{ background: "var(--surface2)" }}
                      >
                        <span
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5"
                          style={{ background: `${color}22`, color }}
                        >
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-sm" style={{ color: "var(--text)" }}>{ex.name}</div>
                          <div className="text-xs mt-0.5" style={{ color }}>
                            {ex.duration}
                          </div>
                          <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{ex.notes}</div>
                        </div>
                      </div>
                    ))}
                    <Button variant="primary" size="md" fullWidth className="mt-2">
                      <Play size={16} />
                      Start Routine
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
