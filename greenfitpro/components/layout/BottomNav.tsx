"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, Dumbbell, Apple } from "lucide-react";

const tabs = [
  { href: "/", label: "Home", icon: Home },
  { href: "/golf", label: "Swing", icon: Activity },
  { href: "/fitness", label: "Fitness", icon: Dumbbell },
  { href: "/nutrition", label: "Nutrition", icon: Apple },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        minHeight: 64,
      }}
    >
      {tabs.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 px-4 py-2 transition-all"
            style={{ color: active ? "var(--primary)" : "var(--text-muted)", opacity: active ? 1 : 0.6 }}
          >
            <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
