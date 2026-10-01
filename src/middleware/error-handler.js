module.exports = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  if (err.code === "P2002") { statusCode = 409; message = "A record with this value already exists"; }
  if (err.code === "P2003") { statusCode = 409; message = "This record is still referenced by another record"; }
  if (err.code === "P2025") { statusCode = 404; message = "Record not found"; }
  if (err.name === "ZodError") { statusCode = 400; message = "Validation failed"; }

  if (statusCode >= 500) console.error(err);
  res.status(statusCode).json({ success: false, error: message });
};
