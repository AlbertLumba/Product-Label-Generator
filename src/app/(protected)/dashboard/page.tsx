// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/dashboard/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function DashboardPage() {
  return (
    <>
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back
        </h2>
        <p className="mt-1 text-gray-500">Manage your labels and products</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <QuickCard
          title="Create Label"
          description="Design a new product label"
          href="/label-maker"
          color="indigo"
        />
        <QuickCard
          title="Products"
          description="Manage your products"
          href="/products"
          color="emerald"
        />
        <QuickCard
          title="Templates"
          description="Label templates"
          href="/templates"
          color="amber"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Labels" value="3" />
        <StatCard label="Products" value="5" />
        <StatCard label="QR Scans" value="12" />
        <StatCard label="Templates" value="3" />
      </div>
    </>
  )
}

function QuickCard({ title, description, href, color }: {
  title: string
  description: string
  href: string
  color: 'indigo' | 'emerald' | 'amber'
}) {
  const colors = {
    indigo: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/50',
    emerald: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/50',
    amber: 'border-amber-200 hover:border-amber-400 bg-amber-50/50',
  }

  return (
    <a
      href={href}
      className={`rounded-xl border p-6 transition ${colors[color]}`}
    >
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </a>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white border border-gray-200 p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
    </div>
  )
}