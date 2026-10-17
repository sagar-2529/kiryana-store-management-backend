// Small, dependency-free fixed-window rate limiter. It is intentionally
// applied at the API edge, before controllers or database access.
function createRateLimit({ windowMs, max, message }) {
  const requests = new Map();

  const cleanup = () => {
    const now = Date.now();
    for (const [key, entry] of requests) {
      if (entry.resetAt <= now) requests.delete(key);
    }
  };
  const cleanupTimer = setInterval(cleanup, windowMs);
  cleanupTimer.unref();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || "unknown";
    let entry = requests.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      requests.set(key, entry);
    }

    entry.count += 1;
    const remaining = Math.max(0, max - entry.count);
    res.set({
      "RateLimit-Limit": String(max),
      "RateLimit-Remaining": String(remaining),
      "RateLimit-Reset": String(Math.ceil(entry.resetAt / 1000)),
    });

    if (entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return res.status(429).json({ success: false, error: message });
    }
    next();
  };
}

const apiLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many requests. Please try again shortly.",
});

const authLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many sign-in attempts. Please try again in 15 minutes.",
});

module.exports = { apiLimiter, authLimiter };
