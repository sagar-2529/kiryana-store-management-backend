function sendSuccess(res, statusCode, data, message) {
  const r = { success: true }; if (message) r.message = message; if (data !== undefined) r.data = data;
  return res.status(statusCode).json(r);
}
function sendError(res, statusCode, message) {
  return res.status(statusCode).json({ success: false, error: message });
}
module.exports = { sendSuccess, sendError };
