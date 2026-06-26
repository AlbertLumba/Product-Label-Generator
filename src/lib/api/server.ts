// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/lib/api/server.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { NextResponse } from "next/server";
import type { ApiResponse } from "./types";

function build<T>(
  success: boolean,
  code: number,
  message: string,
  data: T | null = null,
  error?: string,
): ApiResponse<T> {
  return {
    success,
    code,
    message,
    data,
    error,
    timestamp: new Date().toISOString(),
  };
}

// ─── 2xx ──────────────────────────────
export function ok<T>(data: T, message = "Success") {
  return NextResponse.json(build(true, 200, message, data), { status: 200 });
}

export function created<T>(data: T, message = "Created") {
  return NextResponse.json(build(true, 201, message, data), { status: 201 });
}

// ─── 4xx ──────────────────────────────
export function badRequest(message = "Bad request", error?: string) {
  return NextResponse.json(build(false, 400, message, null, error), {
    status: 400,
  });
}

export function unauthorized(message = "Unauthorized", error?: string) {
  return NextResponse.json(build(false, 401, message, null, error), {
    status: 401,
  });
}

export function forbidden(message = "Forbidden", error?: string) {
  return NextResponse.json(build(false, 403, message, null, error), {
    status: 403,
  });
}

export function notFound(message = "Not found", error?: string) {
  return NextResponse.json(build(false, 404, message, null, error), {
    status: 404,
  });
}

export function conflict(message = "Conflict", error?: string) {
  return NextResponse.json(build(false, 409, message, null, error), {
    status: 409,
  });
}

export function validationError(message = "Validation failed", error?: string) {
  return NextResponse.json(build(false, 422, message, null, error), {
    status: 422,
  });
}

// ─── 5xx ──────────────────────────────
export function serverError(message = "Server error", error?: string) {
  return NextResponse.json(build(false, 500, message, null, error), {
    status: 500,
  });
}