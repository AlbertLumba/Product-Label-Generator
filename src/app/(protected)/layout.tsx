// src/app/(protected)/layout.tsx

import Header from '@/components/layout/header'
import Sidebar from '@/components/layout/sidebar'
import { NavProgress } from '@/components/layout/NavProgress'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavProgress />
      <div className="min-h-screen bg-[var(--gw-bg)]">
        <Header />
        <Sidebar />
        <div className="pt-16 pl-16">
          <main className="p-3 w-full">{children}</main>
        </div>
      </div>
    </>
  )
}