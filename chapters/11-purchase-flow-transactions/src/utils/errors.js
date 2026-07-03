class AppError extends Error { constructor(m, s) { super(m); this.statusCode = s; this.isOperational = true; Error.captureStackTrace(this, this.constructor); } }
class NotFoundError extends AppError { constructor(r = "Resource") { super(`${r} not found`, 404); } }
class ValidationError extends AppError { constructor(m = "Validation failed") { super(m, 400); } }
class UnauthorizedError extends AppError { constructor(m = "Unauthorized") { super(m, 401); } }
module.exports = { AppError, NotFoundError, ValidationError, UnauthorizedError };
