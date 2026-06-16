// src/app/api/constants/errorMessages.ts

export const ErrorMessages = {
  // Auth Errors
  UNAUTHORIZED: 'Authentication required',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Session expired, please login again',
  TOKEN_INVALID: 'Invalid authentication token',
  FORBIDDEN: 'You do not have permission to access this resource',
  EMAIL_EXISTS: 'Email already registered',
  USER_NOT_FOUND: 'User not found',

  // Validation Errors
  VALIDATION_FAILED: 'Validation failed',
  INVALID_INPUT: 'Invalid input data',
  MISSING_FIELDS: 'Required fields are missing',

  // Resource Errors
  RESOURCE_NOT_FOUND: (resource: string) => `${resource} not found`,
  RESOURCE_EXISTS: (resource: string) => `${resource} already exists`,
  RESOURCE_CONFLICT: 'Resource conflict detected',

  // Database Errors
  DATABASE_ERROR: 'Database operation failed',
  DUPLICATE_ENTRY: 'Duplicate entry detected',

  // Rate Limit
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',

  // Server Errors
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
} as const;