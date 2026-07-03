// ============================================================
// Custom Middleware: Request Logger
// Logs method, URL, status code, and response time
// ============================================================

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Store original end to intercept it
  const originalEnd = res.end;

  res.end = function (...args) {
    const duration = Date.now() - start;
    const timestamp = new Date().toISOString();

    // Color code by status
    let statusColor;
    if (res.statusCode >= 500) statusColor = "\x1b[31m"; // Red
    else if (res.statusCode >= 400) statusColor = "\x1b[33m"; // Yellow
    else if (res.statusCode >= 300) statusColor = "\x1b[36m"; // Cyan
    else statusColor = "\x1b[32m"; // Green

    const reset = "\x1b[0m";

    console.log(
      `[${timestamp}] ${req.method.padEnd(7)} ${req.originalUrl.padEnd(40)} ${statusColor}${res.statusCode}${reset} ${duration}ms`
    );

    originalEnd.apply(res, args);
  };

  next();
};

module.exports = requestLogger;
