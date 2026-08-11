// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/(public)/login/page.tsx
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (loading) return // Prevent double submit

    setError('')
    setLoading(true)

    try {
      const res = await api.post<{
        user: { id: string; email: string; name: string }
      }>('/api/auth/login', { email, password })

      if (!res.success) {
        setError(res.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--gw-bg)] px-4">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <h1 className="font-mono text-[24px] tracking-[0.05em] text-[var(--gw-text)]">
            DEBT TRACKER
          </h1>
          <p className="mt-2 font-mono text-[13px] text-[var(--gw-muted)]">
            Sign in to your account
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {error && <Alert variant="error">{error}</Alert>}

            <Input
              label="Email"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="off"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />

            <Button type="submit" variant="primary" size="md" loading={loading} className="w-full">
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Card>

        <Alert variant="info" title="Test Account">
          admin@example.com / admin123
        </Alert>
      </div>
    </div>
  )
}