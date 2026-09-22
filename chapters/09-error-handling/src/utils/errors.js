// ============================================================
// Custom Error Classes
// ============================================================

/**
 * Base application error — all custom errors extend this.
 * @param {string} message - Human-readable error message
 * @param {number} statusCode - HTTP status code
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes expected errors from bugs
    this.name = this.constructor.name;

    // Capture stack trace (excludes constructor call from stack)
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
  }
}

class ValidationError extends AppError {
  constructor(message = "Validation failed", details = null) {
    super(message, 400);
    this.details = details;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

class ConflictError extends AppError {
  constructor(message = "Resource conflict") {
    super(message, 409);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
};
