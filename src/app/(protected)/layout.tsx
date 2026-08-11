// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/layout.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { getUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header user={user} />
      <Sidebar />
      <div className="pl-16 pt-16">
        <main className="p-5">
          {children}
        </main>
      </div>
    </div>
  )
}