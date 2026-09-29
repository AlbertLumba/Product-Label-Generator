// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/components/layout/sidebar.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListChecks,
  FolderKanban,
  Users,
  Activity,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import type { NavIcon } from "@/lib/nav";

const ICON_MAP: Record<NavIcon, React.ElementType> = {
  dashboard: LayoutDashboard,
  tasks: ListChecks,
  groups: FolderKanban,
  users: Users,
  activity: Activity,
};

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const { nav } = useAuth();

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 bg-gw-bg1 border-r border-gw-border z-40 flex flex-col transition-all duration-200 ${
        expanded ? "w-56" : "w-16"
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active =
            pathname === item.path || pathname.startsWith(item.path + "/");
          const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;

          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-gw-fern-bg text-gw-fern-text border border-gw-fern-dim"
                    : "text-gw-sub hover:bg-gw-bg3 hover:text-gw-text border border-transparent"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span
                  className={`whitespace-nowrap ${
                    expanded ? "opacity-100" : "opacity-0 hidden"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gw-border">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center p-1.5 rounded-lg text-gw-muted hover:text-gw-text hover:bg-gw-bg3 transition-colors"
        >
          {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </aside>
  );
}