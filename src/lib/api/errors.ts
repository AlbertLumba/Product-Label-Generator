// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📁 src/lib/api/errors.ts
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const Errors = {
  BAD_REQUEST: (message = 'Bad request') => new AppError(400, 'BAD_REQUEST', message),
  UNAUTHORIZED: (message = 'Unauthorized') => new AppError(401, 'UNAUTHORIZED', message),
  FORBIDDEN: (message = 'Forbidden') => new AppError(403, 'FORBIDDEN', message),
  NOT_FOUND: (message = 'Not found') => new AppError(404, 'NOT_FOUND', message),
  CONFLICT: (message = 'Already exists') => new AppError(409, 'CONFLICT', message),
  VALIDATION: (message = 'Validation failed') => new AppError(422, 'VALIDATION_ERROR', message),
  SERVER: (message = 'Internal server error') => new AppError(500, 'SERVER_ERROR', message),
}