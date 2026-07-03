# Chapter 09 — Error Handling 🟡

## What You'll Learn
- Operational vs Programmer errors
- Custom error classes (`AppError`, `NotFoundError`, `ValidationError`)
- Centralised global error handler
- Prisma error code mapping
- Unhandled rejection & uncaught exception safety nets

## Key Concepts

### Error Categories
| Type | Example | Should we handle? |
|------|---------|-------------------|
| **Operational** | Invalid input, not found, auth failure | ✅ Expected, handle gracefully |
| **Programmer** | TypeError, null reference, bad logic | ❌ Fix the code, don't hide it |

### Custom Error Class Hierarchy
```
Error (built-in)
  └── AppError (base, has statusCode + isOperational)
        ├── NotFoundError (404)
        ├── ValidationError (400)
        ├── UnauthorizedError (401)
        └── ConflictError (409) ← HOMEWORK
```

### Global Error Handler
```js
// MUST have 4 parameters — Express only treats it as error middleware if it does
app.use((err, req, res, next) => { ... });
```

## How to Run

```bash
cd chapters/09-error-handling
npm install
npm run dev
```

---

## 🏠 Homework

1. **ConflictError** — Create a `ConflictError` class (409) for duplicate entries.
2. **Prisma Error Mapping** — Add handling for P2003 (FK constraint), P2014 (relation violation), P2021 (table doesn't exist).
3. **Refactor Controllers** — Replace all inline `sendError()` calls with `throw new NotFoundError()`, `throw new ValidationError()`, etc.

---

## 💡 Tips
- Never `try/catch` every controller — use `asyncHandler` + global error handler
- Always set `isOperational = true` for expected errors — this helps you distinguish "safe" errors from bugs
- In production, never leak error stack traces to the client
