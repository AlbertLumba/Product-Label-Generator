// src/app/api/constants/rateLimits.ts

export const RateLimits = {
  AUTH: {
    LOGIN: { limit: 5, window: '60s' },      // 5 attempts per minute
    REGISTER: { limit: 3, window: '3600s' },  // 3 attempts per hour
    FORGOT_PASSWORD: { limit: 3, window: '3600s' },
    VERIFY_EMAIL: { limit: 10, window: '3600s' },
  },
  API: {
    DEFAULT: { limit: 100, window: '60s' },   // 100 requests per minute
    STRICT: { limit: 20, window: '60s' },     // 20 requests per minute
    RELAXED: { limit: 500, window: '60s' },   // 500 requests per minute
  },
  PROTECTED: {
    READ: { limit: 200, window: '60s' },
    WRITE: { limit: 50, window: '60s' },
    DELETE: { limit: 20, window: '60s' },
  },
} as const;

export type RateLimitConfig = {
  limit: number;
  window: string;
};