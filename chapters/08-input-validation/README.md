# Chapter 08 — Input Validation 🟡

## What You'll Learn
- Why server-side validation is essential (even with frontend validation)
- Zod: a TypeScript-first schema validation library
- Building reusable validation middleware
- Custom validation rules with `.refine()`
- Field-level error messages

## Key Concepts

### Why Validate on Server?
1. Frontend validation can be bypassed (browser dev tools, curl, Postman)
2. Multiple clients may send data (mobile app, web, API consumers)
3. Security: prevent injection, overflow, and malformed data
4. Data integrity: database constraints are your LAST line of defence

### Zod Basics
```js
const z = require('zod');

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  price: z.number().positive("Price must be positive"),
  email: z.string().email("Invalid email"),
  unitType: z.enum(["KG", "GRAM", "LITRE"]),
  description: z.string().optional(),
});
```

### Validation Middleware Factory
```js
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.flatten().fieldErrors });
  }
  req.body = result.data; // Use parsed+cleaned data
  next();
};
```

## How to Run

```bash
cd chapters/08-input-validation
npm install
npm run dev
```

---

## 🏠 Homework

1. **Product Schemas** — Write Zod schemas for Product create/update.
2. **Customer Schemas** — Write Zod schemas for Customer create/update.
3. **Phone Validation** — Add a custom `.refine()`: phone must be exactly 10 digits.
4. **Apply to All Routes** — Add validation middleware to all existing routes.

---

## 💡 Tips
- `safeParse()` returns `{ success, data, error }` without throwing
- Use `schema.partial()` for update schemas (all fields optional)
- `req.body = result.data` ensures only validated fields pass through
