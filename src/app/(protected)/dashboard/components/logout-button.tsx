// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(protected)/dashboard/components/logout-button.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

import { api } from '@/lib/api/client'

export default function LogoutButton() {
  async function handleLogout() {
    await api.post('/api/auth/logout', {})
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
    >
      Sign out
    </button>
  )
}