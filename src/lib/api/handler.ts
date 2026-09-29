// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/lib/api/handler.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextRequest, NextResponse } from "next/server";
import { AppError } from "./errors";
import { serverError, badRequest } from "./server";

type RouteContext<P = Record<string, string>> = {
  params: Promise<P>;
};

type RouteHandler<P = Record<string, string>> = (
  req: NextRequest,
  ctx: RouteContext<P>,
) => Promise<NextResponse>;

export function apiHandler<P = Record<string, string>>(
  fn: RouteHandler<P>,
): (req: NextRequest, ctx: RouteContext<P>) => Promise<NextResponse> {
  return async (req, ctx) => {
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

export async function getBody<T>(req: NextRequest): Promise<T> {
  return req.json();
}