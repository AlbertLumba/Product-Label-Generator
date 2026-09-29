// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/layout.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { getUser } from '@/lib/auth'
import { getNavForRole } from '@/lib/nav'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { NavProgress } from '@/components/layout/NavProgress'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()
  if (!user) redirect('/login')

  const nav = getNavForRole(user.role)

  return (
    <AuthProvider initialUser={user} initialNav={nav}>
      <NavProgress />
      <div className="min-h-screen bg-gw-bg">
        <Header />
        <Sidebar />
        <div className="pt-16 pl-16">
          <main className="p-3 w-full">{children}</main>
        </div>
      </div>
    </AuthProvider>
  )
}