"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import PageHeader from "@/components/layout/PageHeader";
import { EXERCISE_LIBRARY, type ExerciseCategory } from "@/lib/exercises";

const categories: { value: ExerciseCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "golf_specific", label: "Golf" },
  { value: "strength", label: "Strength" },
  { value: "mobility", label: "Mobility" },
  { value: "power", label: "Power" },
  { value: "flexibility", label: "Flexibility" },
  { value: "balance", label: "Balance" },
];

const difficultyColor = {
  beginner: "var(--primary)",
  intermediate: "var(--warning)",
  advanced: "var(--danger)",
};

export default function ExercisesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ExerciseCategory | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = EXERCISE_LIBRARY.filter((e) => {
    const matchSearch =
      !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.muscleGroups.some((m) => m.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "all" || e.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <PageHeader title="Exercise Library" subtitle={`${filtered.length} exercises`} back />

      <div className="px-4 pt-4 space-y-4 pb-6">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <Search size={18} style={{ color: "var(--text-dim)" }} />
          <input
            type="text"
            placeholder="Search exercises or muscles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 py-3 bg-transparent text-sm outline-none"
            style={{ color: "var(--text)" }}
          />
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                background: category === value ? "var(--primary)" : "var(--surface)",
                color: category === value ? "#000" : "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Exercises */}
        <div className="space-y-3">
          {filtered.map((ex) => {
            const isOpen = expanded === ex.id;
            return (
              <Card key={ex.id}>
                <button
                  className="w-full p-4 text-left"
                  onClick={() => setExpanded(isOpen ? null : ex.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-bold" style={{ color: "var(--text)" }}>{ex.name}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0 capitalize"
                      style={{ background: `${difficultyColor[ex.difficulty]}22`, color: difficultyColor[ex.difficulty] }}
                    >
                      {ex.difficulty}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {ex.muscleGroups.slice(0, 3).map((m) => (
                      <span key={m} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--surface2)", color: "var(--text-muted)" }}>
                        {m}
                      </span>
                    ))}
                    {ex.isGolfSpecific && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--primary-dim)", color: "var(--primary)" }}>
                        ⛳ Golf
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{ex.description}</p>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 border-t animate-fade-in" style={{ borderColor: "var(--border)" }}>
                    <div className="pt-3 grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: "Sets", value: ex.sets },
                        { label: "Reps", value: ex.reps },
                        { label: "Rest", value: ex.rest },
                      ].map(({ label, value }) => (
                        <div key={label} className="p-2 rounded-xl" style={{ background: "var(--surface2)" }}>
                          <div className="text-sm font-black" style={{ color: "var(--primary)" }}>{value}</div>
                          <div className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</div>
                        </div>
                      ))}
                    </div>

                    {ex.golfBenefit && (
                      <div className="p-3 rounded-xl" style={{ background: "var(--primary-dim)" }}>
                        <p className="text-xs font-bold mb-0.5" style={{ color: "var(--primary)" }}>Golf Benefit</p>
                        <p className="text-sm" style={{ color: "var(--text)" }}>{ex.golfBenefit}</p>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Instructions</p>
                      <div className="space-y-2">
                        {ex.instructions.map((inst, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0" style={{ background: "var(--primary-dim)", color: "var(--primary)" }}>
                              {i + 1}
                            </span>
                            <p className="text-sm pt-0.5" style={{ color: "var(--text)" }}>{inst}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {ex.tips.length > 0 && (
                      <div className="p-3 rounded-xl" style={{ background: "var(--surface2)" }}>
                        <p className="text-xs font-bold mb-1" style={{ color: "var(--accent)" }}>Tips</p>
                        {ex.tips.map((t, i) => (
                          <p key={i} className="text-sm" style={{ color: "var(--text-muted)" }}>• {t}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
