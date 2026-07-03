// ============================================================
// Helper: Standardised JSON responses
// ============================================================

/**
 * Send a success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {object} data - Response payload
 * @param {string} [message] - Optional message
 */
function sendSuccess(res, statusCode, data, message) {
  const response = { success: true };
  if (message) response.message = message;
  if (data !== undefined) response.data = data;
  return res.status(statusCode).json(response);
}

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 */
function sendError(res, statusCode, message) {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
}

module.exports = { sendSuccess, sendError };
