// src/app/api/helpers/sorting.ts

import { NextRequest } from 'next/server';

export interface SortOptions {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export function getSortOptions(req: NextRequest): SortOptions {
  const url = new URL(req.url);
  
  return {
    sortBy: url.searchParams.get('sortBy') || 'createdAt',
    sortOrder: (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  };
}

export function buildOrderBy(sort: SortOptions): Record<string, 'asc' | 'desc'> {
  return {
    [sort.sortBy]: sort.sortOrder,
  };
}

export function validateSortFields(
  sort: SortOptions,
  allowedFields: string[]
): SortOptions {
  if (!allowedFields.includes(sort.sortBy)) {
    return {
      sortBy: 'createdAt',
      sortOrder: sort.sortOrder,
    };
  }
  
  return sort;
}