# Chapter 08 — Theory: Input Validation with Zod

---

## 1. Why Validate on the Server?

1. **Frontend validation can be bypassed** — Open browser DevTools, change the JS, or use curl/Postman directly
2. **Multiple clients** — Web, mobile, third-party APIs all send data differently
3. **Security** — SQL injection, XSS, buffer overflow all start with unvalidated input
4. **Data integrity** — Your database constraints are the LAST line of defense, not the first

### Validation Layers
```
Client (optional) → API Validation (Zod) → Database Constraints (Prisma/PostgreSQL)
     ↑ UX only          ↑ YOU ARE HERE         ↑ Last resort
```

---

## 2. What is Zod?

Zod is a TypeScript-first validation library. It lets you define **schemas** — blueprints for what valid data looks like.

```js
const z = require("zod");

const schema = z.object({
  name: z.string().min(2).max(100),
  price: z.number().positive(),
  unitType: z.enum(["KG", "GRAM", "LITRE"]),
  description: z.string().optional(),
});
```

### `.safeParse()` — Non-throwing validation
```js
const result = schema.safeParse(req.body);

if (!result.success) {
  // result.error contains field-level errors
  console.log(result.error.flatten().fieldErrors);
  // { name: ["Too short"], price: ["Must be positive"] }
}

// result.data contains the clean, validated data
req.body = result.data;
```

### `.parse()` — Throwing validation
```js
const data = schema.parse(req.body); // Throws ZodError if invalid
```

Use `.safeParse()` in middleware for controlled error handling. Use `.parse()` in tests.

---

## 3. Zod Types

| Zod Type | Validates | Example |
|----------|-----------|---------|
| `z.string()` | Strings | `"hello"` |
| `z.number()` | Numbers | `42`, `3.14` |
| `z.boolean()` | Booleans | `true`, `false` |
| `z.enum([...])` | Specific values | `"KG"`, `"GRAM"` |
| `z.array(z.string())` | Arrays | `["a", "b"]` |
| `z.object({...})` | Objects | `{ name: "x" }` |
| `z.date()` | Dates | `new Date()` |

### String Modifiers
```js
z.string()
  .min(2, "Too short")
  .max(100, "Too long")
  .trim()          // Remove whitespace
  .email()         // Must be valid email
  .url()           // Must be valid URL
  .uuid()          // Must be valid UUID
  .regex(/^\d+$/)  // Must match pattern
```

### Number Modifiers
```js
z.number()
  .positive()      // > 0
  .nonnegative()   // >= 0
  .int()           // Must be integer
  .min(0)          // >= 0
  .max(999999.99)  // <= 999999.99
```

---

## 4. The `validate()` Middleware Factory

```js
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: result.error.flatten().fieldErrors,
    });
  }
  req.body = result.data; // Clean data only!
  next();
};
```

### Usage in Routes
```js
router.post("/", validate(createCategorySchema), controller.create);
//                ↑ validates BEFORE controller runs
```

### Why Replace `req.body`?
`result.data` only contains fields defined in the schema. If someone sends `{ name: "Dairy", isAdmin: true }` and `isAdmin` isn't in the schema, it gets stripped. This prevents **mass assignment** attacks.

---

## 5. Partial Schemas for Updates

```js
const createSchema = z.object({
  name: z.string().min(2),
  price: z.number().positive(),
});

const updateSchema = createSchema.partial();
// All fields become optional: { name?: string, price?: number }
```

`.partial()` creates a copy where every field is optional — perfect for PUT/PATCH routes where you only send changed fields.

---

## 6. Custom Validation with `.refine()`

```js
const customerSchema = z.object({
  phone: z.string()
    .refine(val => /^\d{10}$/.test(val), {
      message: "Phone must be exactly 10 digits",
    })
    .optional(),
});
```

`.refine()` lets you add custom logic that Zod's built-in validators can't handle. The function returns `true` (valid) or `false` (invalid).

---

## 7. Summary

| Concept | What You Learned |
|---------|-----------------|
| Server validation | Essential even with frontend validation |
| Zod | TypeScript-first schema validation library |
| `safeParse` | Non-throwing validation returns `{ success, data, error }` |
| Middleware factory | `validate(schema)` reusable across all routes |
| `req.body` replacement | Only validated fields pass through |
| `.partial()` | Make all fields optional for update schemas |
| `.refine()` | Custom validation rules |

**Next Chapter →** Centralized error handling — one place to handle all errors.
