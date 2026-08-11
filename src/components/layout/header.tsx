// 📁 src/components/layout/header.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, LogOut, Sun, Moon } from 'lucide-react'
import { api } from '@/lib/api/client'
import { useTheme } from '@/lib/theme/ThemeProvider'

type User = {
  id: string
  email: string | null
  name: string
}

export default function Header({ user }: { user: User }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { theme, toggleTheme } = useTheme()

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

  const initials = user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'
  const displayName = user.name || user.email || 'Account'

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left - Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">J</span>
          </div>
          <span className="font-bold text-gray-900 dark:text-white">JASLEND</span>
        </div>

        {/* Right - User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{initials}</span>
            </div>
            <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
              {displayName}
            </span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                {user.email && <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>}
              </div>

              {/* Theme Toggle */}
              <div className="px-2 py-2 border-b border-gray-100 dark:border-gray-800">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                >
                  {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                  {theme === 'light' ? 'Dark mode' : 'Light mode'}
                </button>
              </div>

              {/* Logout */}
              <div className="px-2 py-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-md transition-colors"
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