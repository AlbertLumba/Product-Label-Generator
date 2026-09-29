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
      className={`fixed left-0 top-14 bottom-0 bg-gw-bg1 border-r border-gw-border z-40 flex flex-col transition-[width] duration-200 ease-out ${
        expanded ? "w-48" : "w-14"
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <nav className="flex-1 py-3 px-2 space-y-2 overflow-y-auto overflow-x-hidden">
        {nav.map((item) => {
          const active =
            pathname === item.path || pathname.startsWith(item.path + "/");
          const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;

          return (
            <Link
              key={item.path}
              href={item.path}
              title={!expanded ? item.label : undefined}
              className={`flex items-center h-10 rounded-lg text-sm font-medium transition-colors ${
                expanded ? "px-3 gap-3" : "justify-center"
              } ${
                active
                  ? "bg-gw-fern-bg text-gw-fern-text border border-gw-fern-dim"
                  : "text-gw-sub hover:bg-gw-bg3 hover:text-gw-text border border-transparent"
              }`}
            >
              <Icon size={18} className="shrink-0" />
              <span
                className={`whitespace-nowrap transition-opacity duration-150 ${
                  expanded ? "opacity-100" : "opacity-0 pointer-events-none w-0"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-gw-border">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full h-9 flex items-center justify-center rounded-lg text-gw-muted hover:text-gw-text hover:bg-gw-bg3 transition-colors"
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </aside>
  );
}