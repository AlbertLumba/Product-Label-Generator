// src/app/api/middleware/rateLimit.ts

import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';
import { RateLimits, RateLimitConfig } from '../constants/rateLimits';
import { HttpStatus } from '../constants/httpStatus';

const redis = Redis.fromEnv();

function getWindowInSeconds(window: string): number {
  const value = parseInt(window);
  if (window.includes('s')) return value;
  if (window.includes('m')) return value * 60;
  if (window.includes('h')) return value * 3600;
  return value;
}

export function createRateLimiter(config: RateLimitConfig) {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.limit, `${getWindowInSeconds(config.window)} s`),
  });
}

export async function withRateLimit(
  req: NextRequest,
  handler: Function,
  type: keyof typeof RateLimits = 'API',
  subtype?: string
) {
  const ip = req.ip ?? 'anonymous';
  const path = new URL(req.url).pathname;
  
  let config = RateLimits[type];
  if (subtype && config[subtype as keyof typeof config]) {
    config = config[subtype as keyof typeof config];
  }
  
  const ratelimit = createRateLimiter(config as RateLimitConfig);
  const { success, limit, reset, remaining } = await ratelimit.limit(`${type}:${ip}:${path}`);
  
  if (!success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`,
      },
      {
        status: HttpStatus.TOO_MANY_REQUESTS,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }
  
  const response = await handler();
  
  // Add rate limit headers to response
  response.headers.set('X-RateLimit-Limit', limit.toString());
  response.headers.set('X-RateLimit-Remaining', remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(reset).toISOString());
  
  return response;
}