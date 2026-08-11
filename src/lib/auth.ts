// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/lib/auth.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// NOTE: the debt-tracker schema has no `Session` model, so sessions
// here are a stateless signed cookie (userId + expiry, HMAC-signed)
// instead of a DB-backed session row. That means logout only clears
// the cookie client-side — it can't be revoked server-side before
// expiry. If you need server-side revocation, add a `Session` model
// back to schema.prisma and swap this for DB-backed sessions.

import prisma from '@/lib/prisma'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const SESSION_COOKIE = 'session_token'
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 1 week
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me'

interface SessionPayload {
  userId: string
  exp: number
}

function sign(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(body)
    .digest('base64url')
  return `${body}.${signature}`
}

function verify(token: string): SessionPayload | null {
  const [body, signature] = token.split('.')
  if (!body || !signature) return null

  const expected = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(body)
    .digest('base64url')

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return null
  }

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload
  if (payload.exp < Date.now()) return null

  return payload
}

export async function getUser() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value
    if (!token) return null

    const payload = verify(token)
    if (!payload) return null

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  } catch (error) {
    console.error('getUser error:', error)
    return null
  }
}

export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export function createSession(userId: string): string {
  const exp = Date.now() + SESSION_MAX_AGE_SECONDS * 1000
  return sign({ userId, exp })
}

export const sessionCookieName = SESSION_COOKIE
export const sessionMaxAgeSeconds = SESSION_MAX_AGE_SECONDS