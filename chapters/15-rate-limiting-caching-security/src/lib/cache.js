// ============================================================
// Cache Service — in-memory caching with node-cache
// ============================================================

const NodeCache = require("node-cache");

// stdTTL = default time-to-live in seconds
// checkperiod = how often to check for expired keys
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

/**
 * Cache middleware factory.
 * Caches the full JSON response for GET requests.
 *
 * @param {string} key - Cache key (or function that returns key from req)
 * @param {number} [ttl] - Override default TTL
 */
function cacheMiddleware(key, ttl) {
  return (req, res, next) => {
    const cacheKey = typeof key === "function" ? key(req) : key;
    const cached = cache.get(cacheKey);

    if (cached) {
      console.log(`📦 Cache HIT: ${cacheKey}`);
      return res.json(cached);
    }

    console.log(`🔍 Cache MISS: ${cacheKey}`);

    // Intercept res.json to cache the response
    const originalJson = res.json.bind(res);
    res.json = (data) => {
      cache.set(cacheKey, data, ttl);
      return originalJson(data);
    };

    next();
  };
}

/**
 * Invalidate cache entries by key pattern.
 */
function invalidateCache(...keys) {
  keys.forEach((key) => {
    cache.del(key);
    console.log(`🗑️  Cache invalidated: ${key}`);
  });
}

module.exports = { cache, cacheMiddleware, invalidateCache };
