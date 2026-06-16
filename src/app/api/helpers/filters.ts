// src/app/api/helpers/filters.ts

import { NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';

export interface FilterOptions {
  search?: string;
  searchFields?: string[];
  fromDate?: Date;
  toDate?: Date;
  status?: string;
  category?: string;
  [key: string]: any;
}

export function getFilters(req: NextRequest): FilterOptions {
  const url = new URL(req.url);
  
  return {
    search: url.searchParams.get('search') || undefined,
    fromDate: url.searchParams.get('fromDate') ? new Date(url.searchParams.get('fromDate')!) : undefined,
    toDate: url.searchParams.get('toDate') ? new Date(url.searchParams.get('toDate')!) : undefined,
    status: url.searchParams.get('status') || undefined,
    category: url.searchParams.get('category') || undefined,
  };
}

export function buildWhereClause(
  filters: FilterOptions,
  customFields: Record<string, any> = {}
): Prisma.UserWhereInput {
  const where: Prisma.UserWhereInput = { ...customFields };
  
  // Search across multiple fields
  if (filters.search && filters.searchFields?.length) {
    where.OR = filters.searchFields.map(field => ({
      [field]: { contains: filters.search, mode: 'insensitive' }
    }));
  }
  
  // Date range filter
  if (filters.fromDate || filters.toDate) {
    where.createdAt = {};
    if (filters.fromDate) where.createdAt.gte = filters.fromDate;
    if (filters.toDate) where.createdAt.lte = filters.toDate;
  }
  
  // Status filter
  if (filters.status) {
    where.status = filters.status as any;
  }
  
  return where;
}