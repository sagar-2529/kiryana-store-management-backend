// ============================================================
// Validation Middleware Factory
// Usage: router.post('/', validate(createCategorySchema), controller.create)
// ============================================================

/**
 * Creates Express middleware that validates req.body against a Zod schema.
 * On success: replaces req.body with parsed (clean) data and calls next().
 * On failure: returns 400 with field-level error details.
 *
 * @param {import('zod').ZodSchema} schema - Zod validation schema
 * @returns {Function} Express middleware
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    const formattedErrors = {};

    // Convert arrays to single messages for cleaner API
    for (const [field, messages] of Object.entries(fieldErrors)) {
      formattedErrors[field] = messages[0]; // Take first error per field
    }

    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: formattedErrors,
    });
  }

  // Replace body with parsed data (strips unknown fields, applies transforms)
  req.body = result.data;
  next();
};

/**
 * Validates req.query against a Zod schema (for GET request filters)
 */
const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid query parameters",
      details: result.error.flatten().fieldErrors,
    });
  }
  req.query = result.data;
  next();
};

/**
 * Validates req.params against a Zod schema (for UUID validation etc)
 */
const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: "Invalid URL parameters",
      details: result.error.flatten().fieldErrors,
    });
  }
  next();
};

module.exports = { validate, validateQuery, validateParams };
