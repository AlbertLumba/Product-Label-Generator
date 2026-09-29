// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/middleware.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE = 'session_token'

export function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  const path = req.nextUrl.pathname

  // Never block API routes — API routes handle their own auth.
  if (path.startsWith('/api')) return NextResponse.next()

  const isAuthRoute = path.startsWith('/login') || path.startsWith('/register')
  const isPublic = isAuthRoute || path === '/'

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}