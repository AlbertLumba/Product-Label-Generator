// src/middleware.ts

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SESSION_COOKIE = 'admin_session'

export function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value
  const path = req.nextUrl.pathname

  // 1. Always allow API routes (your login API needs to be reachable)
  if (path.startsWith('/api')) {
    return NextResponse.next()
  }

  const isAuthRoute = path.startsWith('/login')
  // The map (/) and login are public. Everything else is protected.
  const isPublic = isAuthRoute || path === '/'

  // 2. If logged in and trying to access the login page, send to dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // 3. If NOT logged in and trying to access a protected route, send to login
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  // Match all paths except static files, images, and favicon
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}