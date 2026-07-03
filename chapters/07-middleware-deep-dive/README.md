# Chapter 07 — Middleware Deep Dive 🟡

## What You'll Learn
- What middleware really is (the `next()` function chain)
- Application-level vs Router-level vs Error-handling middleware
- Building custom middleware: logger, asyncHandler, responseTime
- Third-party middleware: `cors`, `morgan`
- Why middleware order matters

## Key Concepts

### What is Middleware?
Middleware is a function that has access to `req`, `res`, and `next`. It sits between the incoming request and your route handler:

```
Request → [Middleware 1] → [Middleware 2] → [Route Handler] → Response
                ↓                ↓
          (can modify req)  (can short-circuit)
```

### Middleware Signature
```js
// Regular middleware
const myMiddleware = (req, res, next) => {
  // Do something...
  next(); // Pass to next middleware/handler
};

// Error-handling middleware (4 arguments!)
const errorHandler = (err, req, res, next) => {
  res.status(500).json({ error: err.message });
};
```

### The `asyncHandler` Pattern
Wraps async route handlers to catch errors automatically:
```js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage: router.get('/', asyncHandler(async (req, res) => { ... }));
```

## How to Run

```bash
cd chapters/07-middleware-deep-dive
npm install
npm run dev
```

Watch the console — you'll see detailed request logs from the custom logger!

---

## 🏠 Homework

1. **API Key Middleware** — Create middleware that blocks requests without `x-api-key: kiryana-secret-123` header. Apply to all mutation routes (POST, PUT, DELETE).

2. **Body Size Limiter** — Create middleware that rejects request bodies larger than 1MB with status 413.

3. **Refactor Controllers** — Wrap all existing controller functions with `asyncHandler` to remove try/catch blocks.

---

## 💡 Tips
- Middleware order matters! `app.use(cors())` must come before your routes
- Always call `next()` or send a response — otherwise the request hangs forever
- Error-handling middleware MUST have exactly 4 parameters: `(err, req, res, next)`
