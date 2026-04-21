interface MacroBarProps {
  label: string;
  value: number;
  goal: number;
  color: string;
  unit?: string;
}

export function MacroBar({ label, value, goal, color, unit = "g" }: MacroBarProps) {
  const pct = Math.min(100, goal > 0 ? (value / goal) * 100 : 0);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{label}</span>
        <span className="text-sm" style={{ color: "var(--text-muted)" }}>
          {value}{unit} / {goal}{unit}
        </span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
        <div
          className="h-full rounded-full macro-bar"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

interface MacroCircleProps {
  label: string;
  value: number;
  color: string;
  unit?: string;
}

export function MacroCircle({ label, value, color, unit = "g" }: MacroCircleProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xl font-black" style={{ color }}>{value}</span>
      <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>{unit}</span>
      <span className="text-xs" style={{ color: "var(--text-dim)" }}>{label}</span>
    </div>
  );
}
