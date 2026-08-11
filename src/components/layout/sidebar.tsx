// 📁 src/components/layout/sidebar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const menu = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { label: "Debts", path: "/debts", icon: Wallet },
  { label: "Payments", path: "/payments", icon: CreditCard },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-40 flex flex-col transition-all duration-200 ${
        expanded ? "w-56" : "w-16"
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const active =
            pathname === item.path || pathname.startsWith(item.path + "/");
          const Icon = item.icon;

          return (
            <Link key={item.path} href={item.path}>
              <div
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <Icon size={18} className="shrink-0" />
                <span
                  className={`whitespace-nowrap ${expanded ? "opacity-100" : "opacity-0 hidden"}`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {expanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </aside>
  );
}