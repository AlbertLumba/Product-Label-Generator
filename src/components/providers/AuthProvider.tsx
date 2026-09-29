// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/components/providers/AuthProvider.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

import { createContext, useContext, useCallback, useState } from 'react'
import type { SessionUser, Role } from '@/lib/auth'
import type { NavItem } from '@/lib/nav'

interface AuthState {
  user: SessionUser
  nav: NavItem[]
}

interface AuthContextValue extends AuthState {
  setAuth: (next: AuthState) => void
  refresh: () => Promise<void>
  role: Role
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
  initialUser,
  initialNav,
  children,
}: {
  initialUser: SessionUser
  initialNav: NavItem[]
  children: React.ReactNode
}) {
  const [state, setState] = useState<AuthState>({
    user: initialUser,
    nav: initialNav,
  })

  const setAuth = useCallback((next: AuthState) => {
    setState(next)
  }, [])

  const refresh = useCallback(async () => {
    const res = await fetch('/api/auth/me', { credentials: 'include' })
    const json = await res.json()
    if (res.ok && json?.data?.user) {
      setState({ user: json.data.user, nav: json.data.nav ?? [] })
    }
  }, [])

  const value: AuthContextValue = {
    user: state.user,
    nav: state.nav,
    role: state.user.role,
    setAuth,
    refresh,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}