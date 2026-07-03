const { AppError } = require("../utils/errors");
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  if (err.code === "P2002") { statusCode = 409; message = "Duplicate entry"; }
  if (err.code === "P2025") { statusCode = 404; message = "Not found"; }
  if (statusCode >= 500) console.error("💥", err.stack);
  res.status(statusCode).json({ success: false, error: message });
};
module.exports = errorHandler;
