const errorHandler = (err, req, res, next) => {
  let s = err.statusCode || 500, m = err.message || "Internal server error";
  if (err.code === "P2002") { s = 409; m = "Duplicate entry"; }
  if (err.code === "P2025") { s = 404; m = "Not found"; }
  if (s >= 500) console.error("💥", err.stack);
  res.status(s).json({ success: false, error: m });
};
module.exports = errorHandler;
