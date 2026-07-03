# Chapter 15 — Theory: Rate Limiting, Caching & Security

---

## 1. Rate Limiting

### Why?
Without rate limits, attackers can:
- **Brute-force passwords:** Try 1000 passwords/second on your login endpoint
- **DDoS your API:** Send millions of requests to crash your server
- **Scrape your data:** Download your entire database through the API

### How It Works
```js
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15-minute window
  max: 100,                    // 100 requests per window per IP
  message: { error: "Too many requests" },
});

app.use(limiter);
```

**Strategies:**
| Strategy | How It Works |
|----------|-------------|
| Fixed Window | Count resets every N minutes |
| Sliding Window | Rolling count over the last N minutes |
| Token Bucket | Tokens regenerate over time, consumed per request |

### Per-Route Limits
```js
// Strict limit on login (prevent brute-force)
app.use("/api/v1/auth/login", rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }));

// Lenient limit on read endpoints
app.use("/api/v1/items", rateLimit({ max: 200, windowMs: 60 * 1000 }));
```

---

## 2. Caching

### Why?
If 100 users request `GET /categories` in 1 minute, and categories rarely change, why query the database 100 times?

**Cache:** Store the result once, serve it from memory for subsequent requests.

### In-Memory Cache with `node-cache`
```js
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 }); // 60-second default TTL

// Set
cache.set("categories", data);

// Get
const cached = cache.get("categories");
if (cached) return res.json(cached);  // Cache HIT — no DB query!

// Invalidate (when data changes)
cache.del("categories");
```

### Cache Invalidation — The Hard Problem

"There are only two hard things in Computer Science: cache invalidation and naming things." — Phil Karlton

| Strategy | When to Invalidate |
|----------|-------------------|
| **TTL (Time-To-Live)** | Cache expires after N seconds automatically |
| **Event-based** | Invalidate when data changes (create/update/delete) |
| **Manual** | Admin triggers cache clear |

For the Kiryana Store:
```js
// When a category is created/updated/deleted:
cache.del("categories");
```

### When NOT to Cache
- User-specific data (my purchases, my balance)
- Frequently changing data (stock levels during sales)
- Small result sets (one category by ID)

---

## 3. Helmet — Security Headers

```js
const helmet = require("helmet");
app.use(helmet());
```

Helmet sets 11+ HTTP headers that protect against common attacks:

| Header | Prevents |
|--------|----------|
| `X-Content-Type-Options: nosniff` | Browser guessing content type (MIME sniffing) |
| `X-Frame-Options: SAMEORIGIN` | Your page being embedded in an iframe (clickjacking) |
| `Strict-Transport-Security` | Forces HTTPS |
| `X-XSS-Protection` | Enables browser's XSS filter |
| `Content-Security-Policy` | Controls which resources can load |

One line. Significant security improvement.

---

## 4. HPP — HTTP Parameter Pollution

```js
const hpp = require("hpp");
app.use(hpp());
```

**Attack:** `GET /items?sort=name&sort=DROP TABLE items--`

Without HPP, `req.query.sort` becomes an array `["name", "DROP TABLE items--"]`. HPP picks the last value, preventing injection through duplicate parameters.

---

## 5. SQL Injection (and Why Prisma Helps)

**Attack:**
```
GET /items?name='; DROP TABLE items; --
```

**With raw SQL (vulnerable):**
```js
const query = `SELECT * FROM items WHERE name = '${req.query.name}'`;
// Becomes: SELECT * FROM items WHERE name = ''; DROP TABLE items; --'
// 💀 Database destroyed!
```

**With Prisma (safe):**
```js
await prisma.item.findMany({ where: { name: req.query.name } });
// Prisma parameterizes: SELECT * FROM items WHERE name = $1
// $1 = "'; DROP TABLE items; --" (treated as literal string)
```

Prisma auto-parameterizes all queries. The user input is never interpolated into SQL.

---

## 6. Summary

| Concept | What You Learned |
|---------|-----------------|
| Rate limiting | Prevent brute-force and DDoS attacks |
| Caching | Store results in memory, reduce DB load |
| Cache invalidation | TTL and event-based strategies |
| Helmet | Security headers in one line |
| HPP | Prevent HTTP parameter pollution |
| SQL injection | Prisma auto-parameterizes (safe by default) |

**Next Chapter →** Testing, logging, and deployment — making your app production-ready.
