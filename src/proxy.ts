// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/proxy.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(req: NextRequest) {
  const token = req.cookies.get('session')?.value
  const path = req.nextUrl.pathname

  // Allow API routes
  if (path.startsWith('/api')) {
    return NextResponse.next()
  }

  // If logged in and visiting login/register, redirect to dashboard
  if (token && (path.startsWith('/login') || path.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // If not logged in and visiting protected routes, redirect to login
  if (!token && !path.startsWith('/login') && !path.startsWith('/register') && path !== '/') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}