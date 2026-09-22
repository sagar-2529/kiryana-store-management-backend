// ============================================================
// Global Error Handler Middleware
// This is the SINGLE place that handles ALL errors in the app
// ============================================================

const { AppError } = require("../utils/errors");

/**
 * Maps Prisma error codes to user-friendly responses.
 * Add more mappings as you encounter new error codes.
 */
function handlePrismaError(err) {
  switch (err.code) {
    case "P2002": {
      // Unique constraint violation
      const field = err.meta?.target?.join(", ") || "field";
      return { statusCode: 409, message: `Duplicate value for: ${field}` };
    }
    case "P2025":
      // Record not found
      return { statusCode: 404, message: "Record not found" };
    case "P2003":
      return { statusCode: 409, message: "This record is still referenced by another record" };
    case "P2014":
      return { statusCode: 409, message: "This change would violate a required relation" };
    case "P2021":
      return { statusCode: 500, message: "Database schema is not ready" };
    default:
      return null; // Unknown Prisma error — let it fall through
  }
}

/**
 * Global error handler — must have exactly 4 parameters!
 */
const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details = err.details || undefined;

  // ── Handle Prisma errors ──────────────────────────────────
  if (err.code && err.code.startsWith("P")) {
    const prismaError = handlePrismaError(err);
    if (prismaError) {
      statusCode = prismaError.statusCode;
      message = prismaError.message;
    }
  }

  // ── Handle Zod validation errors ──────────────────────────
  if (err.name === "ZodError") {
    statusCode = 400;
    message = "Validation failed";
    details = err.flatten().fieldErrors;
  }

  // ── Log the error ─────────────────────────────────────────
  if (statusCode >= 500) {
    // Server errors — always log full stack
    console.error(`\n💥 [${statusCode}] ${message}`);
    console.error(err.stack);
  } else if (process.env.NODE_ENV === "development") {
    // Client errors — log in development only
    console.warn(`⚠️  [${statusCode}] ${message}`);
  }

  // ── Send response ─────────────────────────────────────────
  const response = {
    success: false,
    error: message,
  };

  if (details) response.details = details;

  // In development, include the stack trace for debugging
  if (process.env.NODE_ENV === "development" && statusCode >= 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
