import { NextResponse } from 'next/server'

export enum ApiErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR'
}

export interface ApiErrorResponse {
  error: {
    type: ApiErrorType
    message: string
    details?: unknown
  }
  timestamp: string
}

export class ApiError extends Error {
  public readonly type: ApiErrorType
  public readonly statusCode: number
  public readonly details?: unknown

  constructor(type: ApiErrorType, message: string, statusCode: number = 500, details?: unknown) {
    super(message)
    this.type = type
    this.statusCode = statusCode
    this.details = details
    this.name = 'ApiError'
  }
}

export function createErrorResponse(
  type: ApiErrorType,
  message: string,
  statusCode: number = 500,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const response: ApiErrorResponse = {
    error: {
      type,
      message,
      details
    },
    timestamp: new Date().toISOString()
  }

  // Log error for debugging (in development) or monitoring (in production)
  if (process.env.NODE_ENV === 'development') {
    console.error(`[API Error] ${type}: ${message}`, details ? { details } : '')
  }

  return NextResponse.json(response, { status: statusCode })
}

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof ApiError) {
    return createErrorResponse(error.type, error.message, error.statusCode, error.details)
  }

  if (error instanceof Error) {
    return createErrorResponse(
      ApiErrorType.INTERNAL_ERROR,
      'An internal server error occurred',
      500,
      process.env.NODE_ENV === 'development' ? error.message : undefined
    )
  }

  return createErrorResponse(
    ApiErrorType.INTERNAL_ERROR,
    'An unknown error occurred',
    500
  )
}

// Predefined common errors
export const CommonErrors = {
  UNAUTHORIZED: new ApiError(
    ApiErrorType.AUTHENTICATION_ERROR,
    'Authentication required. Please provide valid credentials.',
    401
  ),
  FORBIDDEN: new ApiError(
    ApiErrorType.AUTHORIZATION_ERROR,
    'Access denied. Insufficient permissions.',
    403
  ),
  NOT_FOUND: new ApiError(
    ApiErrorType.NOT_FOUND,
    'The requested resource was not found.',
    404
  ),
  VALIDATION_FAILED: (details?: unknown) => new ApiError(
    ApiErrorType.VALIDATION_ERROR,
    'Request validation failed.',
    400,
    details
  ),
  RATE_LIMITED: new ApiError(
    ApiErrorType.RATE_LIMIT_EXCEEDED,
    'Rate limit exceeded. Too many requests.',
    429
  )
}