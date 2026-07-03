# Chapter 15 — Rate Limiting, Caching & Security 🔴

## What You'll Learn
- Rate limiting with `express-rate-limit` (brute-force protection)
- In-memory caching with `node-cache`
- Security headers with `helmet`
- HTTP parameter pollution with `hpp`
- Cache invalidation patterns
- OWASP Top 10 API security overview

## Key Concepts

### Rate Limiting
```js
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // 5 attempts per window
  message: { error: 'Too many login attempts' },
});
app.use('/api/v1/auth/login', authLimiter);
```

### Caching
```js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 60 }); // 60 second TTL

// Set
cache.set('categories', data);

// Get
const cached = cache.get('categories');
if (cached) return res.json(cached);

// Invalidate
cache.del('categories');
```

### Helmet
```js
app.use(helmet()); // Adds 11+ security headers automatically
```

## How to Run

```bash
cd chapters/15-rate-limiting-caching-security
npm install
npm run dev
```

---

## 🏠 Homework

1. **Rate Limit Purchases** — Max 10 per minute per IP.
2. **Cache Products** — 60s TTL, invalidate on create/update/delete.
3. **Cache Invalidation** — Invalidate categories cache on mutations.
4. **Security Audit** — Document 3 potential vulnerabilities in the app.
