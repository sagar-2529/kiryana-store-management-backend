class AppError extends Error { constructor(m, s) { super(m); this.statusCode = s; this.isOperational = true; } }
class NotFoundError extends AppError { constructor(r = "Resource") { super(`${r} not found`, 404); } }
class ValidationError extends AppError { constructor(m) { super(m, 400); } }
module.exports = { AppError, NotFoundError, ValidationError };
