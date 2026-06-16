// src/app/api/types/requests.ts

import { z } from 'zod';

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterRequest {
  search?: string;
  fromDate?: Date;
  toDate?: Date;
  status?: string;
  category?: string;
}

export interface ApiRequest<T = any> {
  body: T;
  query: PaginatedRequest & FilterRequest;
  params: Record<string, string>;
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// Common validation schemas
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const FilterSchema = z.object({
  search: z.string().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  status: z.string().optional(),
});