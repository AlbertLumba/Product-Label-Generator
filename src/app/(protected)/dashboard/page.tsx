// src/app/(protected)/dashboard/page.tsx

import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Fetch stats and basic lists
  const [terminals, stops, routes] = await Promise.all([
    prisma.terminal.findMany({ select: { id: true, name: true } }),
    prisma.stop.findMany({ select: { id: true, name: true } }),
    prisma.route.findMany({ select: { id: true, code: true, name: true } }),
  ]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--gw-text)]">Admin Dashboard</h1>
      <p className="text-[var(--gw-sub)] mt-1 mb-8">
        Overview of your Jeepney Directory data.
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl">
          <h2 className="text-sm font-semibold text-[var(--gw-muted)] uppercase tracking-wider">Terminals</h2>
          <p className="text-3xl font-bold text-[var(--gw-text)] mt-2">{terminals.length}</p>
        </div>
        <div className="p-6 bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl">
          <h2 className="text-sm font-semibold text-[var(--gw-muted)] uppercase tracking-wider">Stops</h2>
          <p className="text-3xl font-bold text-[var(--gw-text)] mt-2">{stops.length}</p>
        </div>
        <div className="p-6 bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl">
          <h2 className="text-sm font-semibold text-[var(--gw-muted)] uppercase tracking-wider">Routes</h2>
          <p className="text-3xl font-bold text-[var(--gw-text)] mt-2">{routes.length}</p>
        </div>
      </div>

      {/* Data Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--gw-border)] bg-[var(--gw-bg2)]">
            <h3 className="font-semibold text-sm text-[var(--gw-text)]">Terminals</h3>
          </div>
          <ul className="divide-y divide-[var(--gw-border)]">
            {terminals.map((t) => (
              <li key={t.id} className="px-4 py-3 text-sm text-[var(--gw-text)]">
                {t.name}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[var(--gw-bg1)] border border-[var(--gw-border)] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--gw-border)] bg-[var(--gw-bg2)]">
            <h3 className="font-semibold text-sm text-[var(--gw-text)]">Routes</h3>
          </div>
          <ul className="divide-y divide-[var(--gw-border)]">
            {routes.map((r) => (
              <li key={r.id} className="px-4 py-3 text-sm text-[var(--gw-text)]">
                <span className="font-mono text-xs text-[var(--gw-sub)] mr-2">{r.code}</span>
                {r.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}