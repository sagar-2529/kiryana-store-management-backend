class AppError extends Error {
  constructor(message, statusCode) {
    super(message); this.statusCode = statusCode; this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
class NotFoundError extends AppError { constructor(r = "Resource") { super(`${r} not found`, 404); } }
class ValidationError extends AppError { constructor(m = "Validation failed", d) { super(m, 400); this.details = d; } }
class UnauthorizedError extends AppError { constructor(m = "Unauthorized") { super(m, 401); } }
class ForbiddenError extends AppError { constructor(m = "Forbidden") { super(m, 403); } }
module.exports = { AppError, NotFoundError, ValidationError, UnauthorizedError, ForbiddenError };
