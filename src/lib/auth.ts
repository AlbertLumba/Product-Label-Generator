// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/lib/auth.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import prisma from '@/lib/prisma'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function getUser() {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get('session_token')?.value
    
    if (!sessionToken) return null
    
    const session = await validateSession(sessionToken)
    
    if (!session) return null
    
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      companyName: session.user.companyName,
      companyLogo: session.user.companyLogo,
      role: session.user.role,
    }
  } catch (error) {
    console.error('getUser error:', error)
    return null
  }
}

// Keep all your existing functions below:
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  const session = await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return session
}

export async function validateSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    return null
  }

  return session
}

export async function deleteSession(token: string) {
  await prisma.session.delete({
    where: { token },
  })
}