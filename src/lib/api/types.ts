// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/lib/api/types.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ApiResponse<T = unknown> = {
  success: boolean
  code: number
  message: string
  data: T | null
  error?: string
  timestamp: string
}