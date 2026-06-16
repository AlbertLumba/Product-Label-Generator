// src/app/api/helpers/responses.ts

import { NextResponse } from 'next/server';
import { ApiResponse, PaginatedResponse } from '../types/responses';
import { ApiError } from '../types/errors';
import { HttpStatus } from '../constants/httpStatus';

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = HttpStatus.OK
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json(response, { status });
}

export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
): NextResponse {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination: {
      ...pagination,
      hasNext: pagination.page < pagination.totalPages,
      hasPrev: pagination.page > 1,
    },
    timestamp: new Date().toISOString(),
  };
  
  return NextResponse.json(response);
}

export function errorResponse(
  error: Error | ApiError,
  path?: string
): NextResponse {
  if (error instanceof ApiError) {
    const response: ApiResponse = {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString(),
      path,
    };
    
    return NextResponse.json(response, { status: error.statusCode });
  }
  
  // Unknown error
  console.error('Unhandled error:', error);
  const response: ApiResponse = {
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString(),
    path,
  };
  
  return NextResponse.json(response, { status: HttpStatus.INTERNAL_SERVER_ERROR });
}