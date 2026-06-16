// src/app/api/middleware/errorHandler.ts

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ApiError, ValidationError } from '../types/errors';
import { errorResponse } from '../helpers/responses';
import { HttpStatus } from '../constants/httpStatus';
import { ErrorMessages } from '../constants/errorMessages';

export async function errorHandler(
  req: NextRequest,
  handler: Function
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    console.error('API Error:', {
      path: req.url,
      method: req.method,
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Handle Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          return errorResponse(
            new ApiError(HttpStatus.CONFLICT, ErrorMessages.DUPLICATE_ENTRY, error.code),
            req.url
          );
        case 'P2025':
          return errorResponse(
            new ApiError(HttpStatus.NOT_FOUND, ErrorMessages.RESOURCE_NOT_FOUND('Record'), error.code),
            req.url
          );
        default:
          return errorResponse(
            new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, ErrorMessages.DATABASE_ERROR, error.code),
            req.url
          );
      }
    }
    
    // Handle Zod errors
    if (error instanceof Error && error.name === 'ZodError') {
      return errorResponse(
        new ValidationError(ErrorMessages.VALIDATION_FAILED, error),
        req.url
      );
    }
    
    // Handle custom API errors
    if (error instanceof ApiError) {
      return errorResponse(error, req.url);
    }
    
    // Handle unknown errors
    return errorResponse(
      new ApiError(HttpStatus.INTERNAL_SERVER_ERROR, ErrorMessages.INTERNAL_ERROR),
      req.url
    );
  }
}