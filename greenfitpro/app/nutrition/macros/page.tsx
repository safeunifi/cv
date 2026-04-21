"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MacroBar } from "@/components/ui/MacroBar";
import PageHeader from "@/components/layout/PageHeader";

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal: "breakfast" | "lunch" | "dinner" | "snack";
}

const GOALS = { calories: 2200, protein: 165, carbs: 240, fat: 70 };

const DEMO_ENTRIES: FoodEntry[] = [
  { id: "1", name: "Oatmeal with banana", calories: 380, protein: 12, carbs: 68, fat: 6, meal: "breakfast" },
  { id: "2", name: "Grilled chicken salad", calories: 420, protein: 48, carbs: 22, fat: 14, meal: "lunch" },
  { id: "3", name: "Greek yogurt + berries", calories: 180, protein: 18, carbs: 22, fat: 2, meal: "snack" },
  { id: "4", name: "Salmon + sweet potato", calories: 520, protein: 42, carbs: 48, fat: 14, meal: "dinner" },
];

const mealColors: Record<string, string> = {
  breakfast: "#f59e0b",
  lunch: "#22c55e",
  snack: "#84cc16",
  dinner: "#3b82f6",
};

export default function MacrosPage() {
  const [entries, setEntries] = useState<FoodEntry[]>(DEMO_ENTRIES);
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({ name: "", calories: "", protein: "", carbs: "", fat: "", meal: "lunch" as FoodEntry["meal"] });

  const totals = entries.reduce(
    (acc, e) => ({ calories: acc.calories + e.calories, protein: acc.protein + e.protein, carbs: acc.carbs + e.carbs, fat: acc.fat + e.fat }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const addEntry = () => {
    if (!newEntry.name || !newEntry.calories) return;
    setEntries((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newEntry.name,
        calories: Number(newEntry.calories),
        protein: Number(newEntry.protein) || 0,
        carbs: Number(newEntry.carbs) || 0,
        fat: Number(newEntry.fat) || 0,
        meal: newEntry.meal,
      },
    ]);
    setNewEntry({ name: "", calories: "", protein: "", carbs: "", fat: "", meal: "lunch" });
    setShowAdd(false);
  };

  const meals = ["breakfast", "lunch", "snack", "dinner"] as const;

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh" }}>
      <PageHeader
        title="Macro Tracker"
        back
        right={
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "var(--primary)" }}
          >
            <Plus size={20} style={{ color: "#000" }} />
          </button>
        }
      />

      <div className="px-4 pt-4 space-y-5 pb-6">
        {/* Daily totals */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold" style={{ color: "var(--text)" }}>Daily Progress</span>
            <span className="text-sm font-black" style={{ color: "var(--primary)" }}>
              {totals.calories} / {GOALS.calories} kcal
            </span>
          </div>
          <MacroBar label="Protein" value={totals.protein} goal={GOALS.protein} color="#22c55e" />
          <MacroBar label="Carbohydrates" value={totals.carbs} goal={GOALS.carbs} color="#f59e0b" />
          <MacroBar label="Fat" value={totals.fat} goal={GOALS.fat} color="#3b82f6" />
        </Card>

        {/* Add entry form */}
        {showAdd && (
          <Card className="p-4 space-y-3 animate-fade-in">
            <p className="font-bold" style={{ color: "var(--text)" }}>Add Food</p>
            <input
              placeholder="Food name"
              value={newEntry.name}
              onChange={(e) => setNewEntry((p) => ({ ...p, name: e.target.value }))}
              className="w-full p-3 rounded-xl text-sm outline-none"
              style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
            />
            <div className="grid grid-cols-2 gap-2">
              {(["calories", "protein", "carbs", "fat"] as const).map((field) => (
                <input
                  key={field}
                  type="number"
                  placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)}${field === "calories" ? " (kcal)" : " (g)"}`}
                  value={newEntry[field]}
                  onChange={(e) => setNewEntry((p) => ({ ...p, [field]: e.target.value }))}
                  className="p-3 rounded-xl text-sm outline-none"
                  style={{ background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)" }}
                />
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {meals.map((m) => (
                <button
                  key={m}
                  onClick={() => setNewEntry((p) => ({ ...p, meal: m }))}
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold capitalize"
                  style={{
                    background: newEntry.meal === m ? mealColors[m] : "var(--surface2)",
                    color: newEntry.meal === m ? "#000" : "var(--text-muted)",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
              <Button variant="primary" size="sm" onClick={addEntry} className="flex-1">Add</Button>
            </div>
          </Card>
        )}

        {/* Meals by type */}
        {meals.map((meal) => {
          const mealEntries = entries.filter((e) => e.meal === meal);
          if (mealEntries.length === 0) return null;
          const mealCals = mealEntries.reduce((a, e) => a + e.calories, 0);
          return (
            <div key={meal}>
              <div className="flex items-center justify-between mb-2 px-1">
                <h2 className="text-sm font-bold capitalize" style={{ color: mealColors[meal] }}>{meal}</h2>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{mealCals} kcal</span>
              </div>
              <div className="space-y-2">
                {mealEntries.map((entry) => (
                  <Card key={entry.id} className="p-3 flex items-center gap-3">
                    <div
                      className="w-2 h-full min-h-8 rounded-full shrink-0"
                      style={{ background: mealColors[entry.meal] }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{entry.name}</p>
                      <div className="flex gap-3 mt-0.5">
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{entry.calories} kcal</span>
                        <span className="text-xs" style={{ color: "#22c55e" }}>P: {entry.protein}g</span>
                        <span className="text-xs" style={{ color: "#f59e0b" }}>C: {entry.carbs}g</span>
                        <span className="text-xs" style={{ color: "#3b82f6" }}>F: {entry.fat}g</span>
                      </div>
                    </div>
                    <button onClick={() => setEntries((prev) => prev.filter((e) => e.id !== entry.id))}>
                      <Trash2 size={16} style={{ color: "var(--text-dim)" }} />
                    </button>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
