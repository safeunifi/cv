"use client";

import { useState } from "react";
import { Search, Filter } from "lucide-react";
import { Card } from "@/components/ui/Card";
import PageHeader from "@/components/layout/PageHeader";
import { DRILL_LIBRARY } from "@/lib/drills";
import type { DrillCategory, DrillDifficulty } from "@/types/golf";
import { ALL_DRILL_CATEGORIES } from "@/types/golf";

const difficulties: DrillDifficulty[] = ["Beginner", "Intermediate", "Advanced"];

const difficultyColor: Record<DrillDifficulty, string> = {
  Beginner: "var(--primary)",
  Intermediate: "var(--warning)",
  Advanced: "var(--danger)",
};

export default function DrillsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<DrillCategory | "All">("All");
  const [difficulty, setDifficulty] = useState<DrillDifficulty | "All">("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = DRILL_LIBRARY.filter((d) => {
    const matchSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase()) ||
      d.targetFaults.some((f) => f.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "All" || d.category === category;
    const matchDiff = difficulty === "All" || d.difficulty === difficulty;
    return matchSearch && matchCat && matchDiff;
  });

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <PageHeader title="Drill Library" subtitle={`${filtered.length} drills`} back />

      <div className="px-4 pt-4 space-y-4 pb-6">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 rounded-xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <Search size={18} style={{ color: "var(--text-dim)" }} />
          <input
            type="text"
            placeholder="Search drills or faults…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 py-3 bg-transparent text-sm outline-none"
            style={{ color: "var(--text)" }}
          />
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["All", ...difficulties].map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d as DrillDifficulty | "All")}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                background: difficulty === d ? "var(--primary)" : "var(--surface)",
                color: difficulty === d ? "#000" : "var(--text-muted)",
                border: "1px solid var(--border)",
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setCategory("All")}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: category === "All" ? "var(--surface2)" : "transparent",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
            }}
          >
            All
          </button>
          {ALL_DRILL_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              style={{
                background: category === c ? "var(--surface2)" : "transparent",
                color: category === c ? "var(--text)" : "var(--text-muted)",
                border: `1px solid ${category === c ? "var(--primary)" : "var(--border)"}`,
              }}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Drill list */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12" style={{ color: "var(--text-muted)" }}>
              <Filter size={32} className="mx-auto mb-2 opacity-40" />
              <p>No drills match your filters</p>
            </div>
          )}
          {filtered.map((drill) => {
            const isOpen = expanded === drill.id;
            return (
              <Card key={drill.id}>
                <button
                  className="w-full p-4 text-left"
                  onClick={() => setExpanded(isOpen ? null : drill.id)}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="font-bold" style={{ color: "var(--text)" }}>{drill.name}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{
                        background: `${difficultyColor[drill.difficulty]}22`,
                        color: difficultyColor[drill.difficulty],
                      }}
                    >
                      {drill.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: "var(--surface2)", color: "var(--text-muted)" }}
                    >
                      {drill.category}
                    </span>
                    {drill.targetFaults.map((f) => (
                      <span
                        key={f}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "var(--primary-dim)", color: "var(--primary)" }}
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>{drill.description}</p>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-3 animate-fade-in border-t" style={{ borderColor: "var(--border)" }}>
                    {drill.equipment.length > 0 && (
                      <div className="pt-3">
                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Equipment</p>
                        <p className="text-sm" style={{ color: "var(--text)" }}>{drill.equipment.join(", ")}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Steps</p>
                      <div className="space-y-2">
                        {drill.steps.map((step, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <span
                              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                              style={{ background: "var(--primary-dim)", color: "var(--primary)" }}
                            >
                              {i + 1}
                            </span>
                            <p className="text-sm pt-0.5" style={{ color: "var(--text)" }}>{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl" style={{ background: "var(--surface2)" }}>
                      <p className="text-xs font-bold mb-1" style={{ color: "var(--accent)" }}>Reps: {drill.reps}</p>
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        <span className="font-bold" style={{ color: "var(--text)" }}>Key Focus: </span>
                        {drill.keyFocus}
                      </p>
                    </div>
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
