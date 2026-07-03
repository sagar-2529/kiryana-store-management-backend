// ============================================================
// Custom Middleware: Response Time Header
// Adds X-Response-Time header to every response
// ============================================================

const responseTime = (req, res, next) => {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    // Note: we can't set headers after finish, so we set it before
  });

  // Override writeHead to inject the header before it's sent
  const originalWriteHead = res.writeHead;
  const startTime = Date.now();

  res.writeHead = function (...args) {
    res.setHeader("X-Response-Time", `${Date.now() - startTime}ms`);
    originalWriteHead.apply(res, args);
  };

  next();
};

module.exports = responseTime;
