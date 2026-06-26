// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/lib/api/handler.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextRequest, NextResponse } from "next/server";
import { AppError } from "./errors";
import { serverError, badRequest } from "./server";

type RouteHandler = (req: NextRequest, ctx?: unknown) => Promise<NextResponse>;
type WrappedHandler = (req: NextRequest, ctx?: unknown) => Promise<NextResponse>;

export function apiHandler(fn: RouteHandler): WrappedHandler {
  return async (req: NextRequest, ctx?: unknown) => {
    try {
      return await fn(req, ctx);
    } catch (error) {
      console.error(error);
      if (error instanceof AppError) {
        return badRequest(error.message, error.code);
      }
      return serverError();
    }
  };
}

export function getPagination(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(sp.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "10")));
  return { page, limit, skip: (page - 1) * limit };
}

export async function getBody<T>(req: NextRequest): Promise<T> {
  return req.json();
}