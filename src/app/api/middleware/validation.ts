// src/app/api/middleware/validation.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ValidationError } from '../types/errors';
import { errorResponse } from '../helpers/responses';

export function validateBody<T extends z.ZodSchema>(
  schema: T,
  handler: (req: NextRequest, validated: z.infer<T>) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const validated = schema.parse(body);
      return handler(req, validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse(
          new ValidationError('Validation failed', error.errors),
          req.url
        );
      }
      throw error;
    }
  };
}

export function validateQuery<T extends z.ZodSchema>(
  schema: T,
  handler: (req: NextRequest, validated: z.infer<T>) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const url = new URL(req.url);
      const query = Object.fromEntries(url.searchParams.entries());
      const validated = schema.parse(query);
      return handler(req, validated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return errorResponse(
          new ValidationError('Invalid query parameters', error.errors),
          req.url
        );
      }
      throw error;
    }
  };
}

// Common validation schemas
export const IdParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
});

export const EmailSchema = z.string().email('Invalid email format');
export const PasswordSchema = z.string().min(8, 'Password must be at least 8 characters');