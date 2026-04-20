"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

interface Props {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, back, right }: Props) {
  const router = useRouter();
  return (
    <header
      className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
      style={{ background: "var(--background)", borderBottom: "1px solid var(--border)" }}
    >
      {back && (
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-full"
          style={{ background: "var(--surface)" }}
        >
          <ChevronLeft size={20} />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold truncate" style={{ color: "var(--text)" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}
