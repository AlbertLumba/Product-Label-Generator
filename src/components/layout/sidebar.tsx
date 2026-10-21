// src/components/layout/sidebar.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map as MapIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Public Map", path: "/map", icon: MapIcon },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-14 bottom-0 bg-[var(--gw-bg1)] border-r border-[var(--gw-border)] z-40 flex flex-col transition-[width] duration-200 ease-out ${
        expanded ? "w-48" : "w-14"
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <nav className="flex-1 py-3 px-2 space-y-2 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          // Check if the current path matches the item's path
          const active = pathname === item.path || pathname.startsWith(item.path + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              href={item.path}
              title={!expanded ? item.label : undefined}
              className={`flex items-center h-10 rounded-lg text-sm font-medium transition-colors ${
                expanded ? "px-3 gap-3" : "justify-center"
              } ${
                active
                  ? "bg-[var(--gw-fern-bg)] text-[var(--gw-fern-text)] border border-[var(--gw-fern-dim)]"
                  : "text-[var(--gw-sub)] hover:bg-[var(--gw-bg3)] hover:text-[var(--gw-text)] border border-transparent"
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

      <div className="p-2 border-t border-[var(--gw-border)]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full h-9 flex items-center justify-center rounded-lg text-[var(--gw-muted)] hover:text-[var(--gw-text)] hover:bg-[var(--gw-bg3)] transition-colors"
        >
          {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </aside>
  );
}