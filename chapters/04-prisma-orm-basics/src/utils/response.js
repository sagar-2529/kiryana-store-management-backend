// ============================================================
// Helper: Standardised JSON responses
// ============================================================

function sendSuccess(res, statusCode, data, message) {
  const response = { success: true };
  if (message) response.message = message;
  if (data !== undefined) response.data = data;
  return res.status(statusCode).json(response);
}

function sendError(res, statusCode, message) {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
}

module.exports = { sendSuccess, sendError };
