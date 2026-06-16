// src/app/api/middleware/auth.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AuthenticationError } from '../types/errors';
import { errorResponse } from '../helpers/responses';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
}

type Handler = (req: NextRequest, context: { user: AuthUser }) => Promise<NextResponse>;

export function withAuth(handler: Handler, requireAdmin: boolean = false) {
  return async (req: NextRequest, context: any) => {
    try {
      // Get token from header
      const token = req.headers.get('authorization')?.replace('Bearer ', '');
      
      if (!token) {
        throw new AuthenticationError();
      }
      
      // Verify with Supabase
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        throw new AuthenticationError('Invalid or expired token');
      }
      
      // Get user from database with role
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
        select: { id: true, email: true, name: true, role: true }
      });
      
      if (!dbUser) {
        throw new AuthenticationError('User not found');
      }
      
      // Check admin requirement
      if (requireAdmin && dbUser.role !== 'ADMIN') {
        throw new AuthenticationError('Admin access required');
      }
      
      // Add user to context
      return handler(req, { ...context, user: dbUser });
      
    } catch (error) {
      return errorResponse(error);
    }
  };
}