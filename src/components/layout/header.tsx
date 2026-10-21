// src/components/layout/header.tsx

'use client'

import Link from 'next/link'
import { Map } from 'lucide-react'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-[var(--gw-bg1)] border-b border-[var(--gw-border)] z-50">
      <div className="h-full flex items-center justify-between">
        <div className="w-14 h-full flex items-center justify-center flex-shrink-0 border-r border-[var(--gw-border)]">
          <div className="w-7 h-7 bg-[var(--gw-fern)] rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">J</span>
          </div>
        </div>

        <div className="flex-1 px-4 flex items-center justify-between">
          <span className="font-bold text-sm text-[var(--gw-text)]">Jeepney Admin</span>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-[var(--gw-sub)] hover:text-[var(--gw-fern-text)] transition-colors"
          >
            <Map size={16} />
            Back to Map
          </Link>
        </div>
      </div>
    </header>
  )
}