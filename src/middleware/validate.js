const { ZodError } = require("zod");

// Parses API input before it reaches a controller. Parsed values replace the
// raw request values, so controllers receive predictable, safe data.
function validate(schemas) {
  return (req, res, next) => {
    try {
      for (const [location, schema] of Object.entries(schemas)) {
        req[location] = schema.parse(req[location]);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

function validationErrorDetails(error) {
  if (!(error instanceof ZodError)) return null;
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "request",
    message: issue.message,
  }));
}

module.exports = { validate, validationErrorDetails };
