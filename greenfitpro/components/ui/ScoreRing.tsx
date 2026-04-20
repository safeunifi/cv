"use client";

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ScoreRing({ score, size = 120, strokeWidth = 10, label }: Props) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  const color =
    score >= 80 ? "var(--primary)" :
    score >= 60 ? "var(--accent)" :
    score >= 40 ? "var(--warning)" :
    "var(--danger)";

  const grade =
    score >= 90 ? "Excellent" :
    score >= 80 ? "Very Good" :
    score >= 70 ? "Good" :
    score >= 60 ? "Fair" :
    score >= 50 ? "Needs Work" : "Beginner";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="score-ring">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>{score}</span>
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>/ 100</span>
        </div>
      </div>
      {label && <span className="text-sm font-semibold" style={{ color }}>{label || grade}</span>}
    </div>
  );
}
