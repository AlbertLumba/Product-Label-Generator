// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/app/api/auth/me/route.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { apiHandler } from '@/lib/api/handler'
import { ok, unauthorized } from '@/lib/api/server'
import { getUser } from '@/lib/auth'
import { getNavForRole } from '@/lib/nav'

export const GET = apiHandler(async () => {
  const user = await getUser()
  if (!user) return unauthorized('Not logged in')

  return ok({
    user,
    nav: getNavForRole(user.role),
  })
})