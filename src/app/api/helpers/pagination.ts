// src/app/api/helpers/pagination.ts

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export function getPaginationParams(req: NextRequest): PaginationParams {
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '10')));
  
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function getPaginationMetadata(total: number, params: PaginationParams) {
  const totalPages = Math.ceil(total / params.limit);
  
  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
  };
}

export function withPagination<T extends { id?: string }>(
  data: T[],
  params: PaginationParams,
  total: number
) {
  return {
    data,
    pagination: getPaginationMetadata(total, params),
  };
}