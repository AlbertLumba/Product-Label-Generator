// GROUPED

// // src/lib/api/client.ts
// "use client";

// import type { ApiResponse } from "./types";

// async function request<T>(
//   url: string,
//   options: RequestInit = {},
// ): Promise<ApiResponse<T>> {
//   const res = await fetch(url, {
//     ...options,
//     headers: { "Content-Type": "application/json", ...options.headers },
//     credentials: "include",
//   });
//   return res.json();
// }

// export const api = {
//   get: <T>(url: string) => request<T>(url),
//   post: <T>(url: string, body: unknown) =>
//     request<T>(url, { method: "POST", body: JSON.stringify(body) }),
//   put: <T>(url: string, body: unknown) =>
//     request<T>(url, { method: "PUT", body: JSON.stringify(body) }),
//   patch: <T>(url: string, body: unknown) =>
//     request<T>(url, { method: "PATCH", body: JSON.stringify(body) }),
//   delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
// };


// // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// // 📁 src/lib/api/errors.ts
// // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// export class AppError extends Error {
//   constructor(
//     public statusCode: number,
//     public code: string,
//     message: string
//   ) {
//     super(message)
//     this.name = 'AppError'
//   }
// }

// export const Errors = {
//   BAD_REQUEST: (message = 'Bad request') => new AppError(400, 'BAD_REQUEST', message),
//   UNAUTHORIZED: (message = 'Unauthorized') => new AppError(401, 'UNAUTHORIZED', message),
//   FORBIDDEN: (message = 'Forbidden') => new AppError(403, 'FORBIDDEN', message),
//   NOT_FOUND: (message = 'Not found') => new AppError(404, 'NOT_FOUND', message),
//   CONFLICT: (message = 'Already exists') => new AppError(409, 'CONFLICT', message),
//   VALIDATION: (message = 'Validation failed') => new AppError(422, 'VALIDATION_ERROR', message),
//   SERVER: (message = 'Internal server error') => new AppError(500, 'SERVER_ERROR', message),
// }

// // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// // 📁 src/lib/api/handler.ts
// // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// import { NextRequest } from "next/server";
// import { AppError } from "./errors";
// import { serverError, badRequest } from "./server";

// export function apiHandler(
//   fn: (req: NextRequest, ctx?: any) => Promise<Response>,
// ) {
//   return async (req: NextRequest, ctx?: any) => {
//     try {
//       return await fn(req, ctx);
//     } catch (error) {
//       console.error(error);
//       if (error instanceof AppError) {
//         return badRequest(error.message, error.code);
//       }
//       return serverError();
//     }
//   };
// }

// export function getPagination(req: NextRequest) {
//   const sp = req.nextUrl.searchParams;
//   const page = Math.max(1, parseInt(sp.get("page") || "1"));
//   const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") || "10")));
//   return { page, limit, skip: (page - 1) * limit };
// }

// export async function getBody<T>(req: NextRequest): Promise<T> {
//   return req.json();
// }


// // src/lib/api/server.ts
// // ✅ This file is only for server components and API routes

// import { NextResponse } from "next/server";
// import type { ApiResponse } from "./types";

// function build<T>(
//   success: boolean,
//   code: number,
//   message: string,
//   data: T | null = null,
//   error?: string,
// ): ApiResponse<T> {
//   return {
//     success,
//     code,
//     message,
//     data,
//     error,
//     timestamp: new Date().toISOString(),
//   };
// }

// // ─── 2xx ──────────────────────────────
// export function ok<T>(data: T, message = "Success") {
//   return NextResponse.json(build(true, 200, message, data), { status: 200 });
// }

// export function created<T>(data: T, message = "Created") {
//   return NextResponse.json(build(true, 201, message, data), { status: 201 });
// }

// // ─── 4xx ──────────────────────────────
// export function badRequest(message = "Bad request", error?: string) {
//   return NextResponse.json(build(false, 400, message, null, error), {
//     status: 400,
//   });
// }

// export function unauthorized(message = "Unauthorized", error?: string) {
//   return NextResponse.json(build(false, 401, message, null, error), {
//     status: 401,
//   });
// }

// export function forbidden(message = "Forbidden", error?: string) {
//   return NextResponse.json(build(false, 403, message, null, error), {
//     status: 403,
//   });
// }

// export function notFound(message = "Not found", error?: string) {
//   return NextResponse.json(build(false, 404, message, null, error), {
//     status: 404,
//   });
// }

// export function conflict(message = "Conflict", error?: string) {
//   return NextResponse.json(build(false, 409, message, null, error), {
//     status: 409,
//   });
// }

// export function validationError(message = "Validation failed", error?: string) {
//   return NextResponse.json(build(false, 422, message, null, error), {
//     status: 422,
//   });
// }

// // ─── 5xx ──────────────────────────────
// export function serverError(message = "Server error", error?: string) {
//   return NextResponse.json(build(false, 500, message, null, error), {
//     status: 500,
//   });
// }


// // src/lib/api/types.ts
// // ✅ This file is safe for both client and server

// export type ApiResponse<T = unknown> = {
//   success: boolean
//   code: number
//   message: string
//   data: T | null
//   error?: string
//   timestamp: string
// }

// // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// // 📁 src/lib/api/validate.ts
// // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// import { z } from "zod";
// import { validationError } from "./server";

// export function validate<T>(schema: z.ZodSchema<T>, data: unknown) {
//   const result = schema.safeParse(data);
//   if (!result.success) {
//     const errors = result.error.issues
//       .map((e) => `${e.path.join(".")}: ${e.message}`)
//       .join(", ");
//     return {
//       success: false as const,
//       response: validationError("Validation failed", errors),
//     };
//   }
//   return { success: true as const, data: result.data };
// }
