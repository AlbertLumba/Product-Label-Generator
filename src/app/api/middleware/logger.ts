// src/app/api/middleware/logger.ts

import { NextRequest, NextResponse } from 'next/server';

export async function loggerMiddleware(req: NextRequest, handler: Function) {
  const start = Date.now();
  const { method, url } = req;
  const ip = req.ip ?? 'unknown';
  
  // Log request
  console.log(`[${new Date().toISOString()}] ${method} ${url} - ${ip}`);
  
  try {
    const response = await handler();
    const duration = Date.now() - start;
    
    // Log response
    console.log(
      `[${new Date().toISOString()}] ${method} ${url} - ${response.status} - ${duration}ms`
    );
    
    return response;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(
      `[${new Date().toISOString()}] ${method} ${url} - ERROR - ${duration}ms`,
      error
    );
    throw error;
  }
}