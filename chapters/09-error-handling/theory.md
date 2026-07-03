# Chapter 09 — Theory: Centralized Error Handling

---

## 1. The Problem

Without centralized handling, every controller has its own error logic:
```js
// Controller A
res.status(404).json({ error: "Not found" });
// Controller B
res.status(404).json({ message: "Resource not found", code: 404 });
// Controller C
res.status(404).send("not found");
```

Three different error formats! The client can't predict the response shape.

---

## 2. Operational vs Programmer Errors

| Type | Example | Handle? |
|------|---------|---------|
| **Operational** | Invalid input, not found, auth failure, DB down | ✅ Expected, handle gracefully |
| **Programmer** | TypeError, null reference, wrong variable name | ❌ Fix the bug, don't mask it |

```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;  // ← This flag matters!
  }
}
```

`isOperational = true` means "we anticipated this error." In production, operational errors get clean responses. Programmer errors get logged and return generic "Internal server error."

---

## 3. Custom Error Class Hierarchy

```
Error (built-in)
  └── AppError (statusCode, isOperational)
        ├── NotFoundError (404)
        ├── ValidationError (400)
        ├── UnauthorizedError (401)
        └── ForbiddenError (403)
```

### Usage in Controllers
```js
// Before — inline, inconsistent
if (!category) return res.status(404).json({ error: "Not found" });

// After — throw and forget (error handler catches it)
if (!category) throw new NotFoundError("Category");
```

---

## 4. Global Error Handler

```js
app.use((err, req, res, next) => {
  // Must have 4 params — Express checks the function's length!
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Map Prisma errors
  if (err.code === "P2002") { statusCode = 409; message = "Duplicate entry"; }
  if (err.code === "P2025") { statusCode = 404; message = "Not found"; }

  // Don't leak details in production
  if (statusCode >= 500 && process.env.NODE_ENV === "production") {
    message = "Internal server error";
  }

  res.status(statusCode).json({ success: false, error: message });
});
```

### How Errors Reach the Handler

1. `throw new NotFoundError()` in a controller
2. `asyncHandler` catches it via `.catch(next)`
3. `next(error)` skips all remaining middleware and jumps to the error handler
4. Error handler sends the response

---

## 5. Process-Level Safety Nets

```js
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION:", error);
  process.exit(1);
});
```

These catch errors that escape Express entirely (e.g., a rejected promise without `.catch()`). In production, you'd let the process manager (PM2) restart the server.

---

## 6. Summary

| Concept | What You Learned |
|---------|-----------------|
| Centralized handling | One middleware handles ALL errors |
| Error classes | `AppError` hierarchy with status codes |
| `isOperational` | Distinguishes expected errors from bugs |
| `throw` pattern | Throw errors in controllers, catch centrally |
| Prisma mapping | P2002→409, P2025→404, etc. |
| Process safety | `unhandledRejection`, `uncaughtException` |

**Next Chapter →** Authentication with JWT and bcrypt.
