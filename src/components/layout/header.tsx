// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/components/layout/header.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  Settings,
} from 'lucide-react'
import { api } from '@/lib/api/client'
import { useTheme } from '@/lib/theme/ThemeProvider'
import { useAuth } from '@/components/providers/AuthProvider'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { theme, toggleTheme } = useTheme()
  const { user } = useAuth()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleLogout() {
    await api.post('/api/auth/logout', {})
    window.location.href = '/login'
  }

  const initials =
    user.name?.charAt(0).toUpperCase() ||
    user.email?.charAt(0).toUpperCase() ||
    '?'
  const displayName = user.name || user.email || 'Account'
  const isAdmin = user.role === 'ADMIN'

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-gw-bg1 border-b border-gw-border z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gw-fern rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">J</span>
          </div>
          <span className="font-bold text-gw-text">JASLEND</span>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-gw-bg3 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gw-bg3 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-gw-fern-text">
                {initials}
              </span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-gw-sub">
              {displayName}
            </span>
            {isAdmin && (
              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono tracking-[0.1em] uppercase bg-gw-fern-bg text-gw-fern-text border border-gw-fern-dim">
                <ShieldCheck size={10} /> Admin
              </span>
            )}
            <ChevronDown
              size={14}
              className={`text-gw-muted transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-gw-bg1 border border-gw-border rounded-lg shadow-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gw-border">
                <p className="text-sm font-medium text-gw-text">
                  {user.name}
                </p>
                {user.email && (
                  <p className="text-xs text-gw-muted">{user.email}</p>
                )}
                <p className="mt-1 text-[11px] font-mono uppercase tracking-[0.1em] text-gw-fern-text">
                  {user.role}
                </p>
              </div>

              <div className="px-2 py-2 border-b border-gw-border">
                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gw-sub hover:bg-gw-bg3 hover:text-gw-text rounded-md transition-colors"
                >
                  <Settings size={14} />
                  Settings
                </Link>
              </div>

              <div className="px-2 py-2 border-b border-gw-border">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gw-sub hover:bg-gw-bg3 hover:text-gw-text rounded-md transition-colors"
                >
                  {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                  {theme === 'light' ? 'Dark mode' : 'Light mode'}
                </button>
              </div>

              <div className="px-2 py-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gw-red hover:bg-gw-red-bg rounded-md transition-colors"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}