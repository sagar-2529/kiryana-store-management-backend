# Chapter 05 — Theory: CRUD Operations (Category & Product)

---

## 1. What is CRUD?

CRUD stands for **Create, Read, Update, Delete** — the four fundamental operations on any data resource. Every database-backed application is essentially a collection of CRUD operations.

### CRUD ↔ HTTP ↔ SQL ↔ Prisma Mapping

| Operation | HTTP Method | SQL | Prisma | Route |
|-----------|------------|-----|--------|-------|
| **C**reate | POST | INSERT INTO | `prisma.create()` | `POST /categories` |
| **R**ead all | GET | SELECT * | `prisma.findMany()` | `GET /categories` |
| **R**ead one | GET | SELECT WHERE id= | `prisma.findUnique()` | `GET /categories/:id` |
| **U**pdate | PUT/PATCH | UPDATE SET | `prisma.update()` | `PUT /categories/:id` |
| **D**elete | DELETE | DELETE FROM | `prisma.delete()` | `DELETE /categories/:id` |

### Real-World Application

In the Kiryana Store, CRUD applies to every entity:
- **Categories:** Create "Dairy", list all categories, rename "Spices" to "Spices & Masala", delete empty categories
- **Products:** Add "Milk" under Dairy, view products by category
- **Items:** Add "Amul Gold 1L" at ₹68, update price to ₹72, check stock

---

## 2. Create Operation Deep Dive

```js
const category = await prisma.category.create({
  data: {
    name: "Dairy",
    description: "Milk, butter, cheese",
    adminId: "some-uuid",
  },
});
```

### What Happens Under the Hood?

1. **Prisma generates SQL:**
   ```sql
   INSERT INTO categories (id, name, description, admin_id, created_at, updated_at)
   VALUES (gen_random_uuid(), 'Dairy', 'Milk, butter, cheese', 'some-uuid', NOW(), NOW())
   RETURNING *;
   ```

2. **`RETURNING *`** — PostgreSQL returns the complete inserted row, including auto-generated fields (`id`, `createdAt`). This is why `prisma.create()` returns the full object.

3. **Unique constraint check** — If `name` has `@unique` and "Dairy" already exists, PostgreSQL rejects the INSERT and Prisma throws error code `P2002`.

### Foreign Key Validation

Before creating a product, validate that `categoryId` exists:

```js
const category = await prisma.category.findUnique({
  where: { id: categoryId },
});
if (!category) {
  return sendError(res, 400, "Category not found");
}
```

**Why validate manually?** The database will reject invalid foreign keys (P2003 error), but a manual check gives a better error message: "Category 'abc' not found" vs "Foreign key constraint failed."

---

## 3. Read Operations Deep Dive

### `findMany()` — List with Filtering

```js
const categories = await prisma.category.findMany({
  where: {
    name: { contains: "dairy", mode: "insensitive" },
  },
  include: {
    _count: { select: { products: true } },
  },
  orderBy: { name: "asc" },
});
```

**Where clause operators:**
| Operator | SQL | Example |
|----------|-----|---------|
| `equals` | `=` | `{ name: { equals: "Dairy" } }` |
| `contains` | `LIKE '%x%'` | `{ name: { contains: "air" } }` |
| `startsWith` | `LIKE 'x%'` | `{ name: { startsWith: "D" } }` |
| `gt`, `gte` | `>`, `>=` | `{ price: { gte: 100 } }` |
| `lt`, `lte` | `<`, `<=` | `{ stock: { lt: 10 } }` |
| `in` | `IN (...)` | `{ unitType: { in: ["KG", "GRAM"] } }` |
| `not` | `!=` | `{ name: { not: "Dairy" } }` |
| `mode: "insensitive"` | `ILIKE` | Case-insensitive search |

### `findUnique()` — Get by Unique Field

```js
const category = await prisma.category.findUnique({
  where: { id: "some-uuid" },
  include: { products: true },
});
```

`findUnique` only works with fields marked `@id` or `@unique`. For non-unique fields, use `findFirst()`.

### `include` — Eager Loading Relations

```js
include: {
  products: {
    include: {
      _count: { select: { items: true } }
    }
  }
}
```

This generates SQL JOINs. The response nests related data:
```json
{
  "id": "abc",
  "name": "Dairy",
  "products": [
    { "id": "xyz", "name": "Milk", "_count": { "items": 3 } }
  ]
}
```

---

## 4. Update Operation Deep Dive

```js
const category = await prisma.category.update({
  where: { id: req.params.id },
  data: {
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description }),
  },
});
```

### The Spread Pattern for Partial Updates

```js
...(name !== undefined && { name })
```

**How this works:**
1. If `name` is `"Dairy"` → `true && { name: "Dairy" }` → `{ name: "Dairy" }` → spread into data
2. If `name` is `undefined` → `false && { name: undefined }` → `false` → spread of `false` is nothing

This ensures only provided fields are updated. If the client sends `{ description: "New desc" }` without `name`, the name stays unchanged.

### PUT vs PATCH

| Method | Behavior | Use Case |
|--------|----------|----------|
| **PUT** | Replace the entire resource | Client sends ALL fields |
| **PATCH** | Partially modify | Client sends only changed fields |

In practice, most APIs use PUT with partial update logic (like our spread pattern). Pure PUT (requiring all fields) is less practical.

---

## 5. Delete Operation Deep Dive

### Cascading Delete Considerations

```js
// Check for linked records before deleting
const category = await prisma.category.findUnique({
  where: { id: req.params.id },
  include: { _count: { select: { products: true } } },
});

if (category._count.products > 0) {
  return sendError(res, 400, "Cannot delete: has linked products");
}
```

**Why not just cascade delete?** In a store management system, deleting a category shouldn't automatically delete all products and items — that could destroy inventory data. We check first and require manual cleanup.

### Cascade Options in Prisma Schema

```prisma
model Product {
  category Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  // Cascade = delete products when category is deleted
  // Restrict = prevent deletion if products exist (default)
  // SetNull = set categoryId to null on products
}
```

For the Kiryana Store, we use the default `Restrict` and handle it in code with friendly error messages.

---

## 6. Error Handling Patterns

### Prisma Error Codes in CRUD

```js
try {
  await prisma.category.update({ where: { id }, data });
} catch (error) {
  if (error.code === "P2025") {
    // Record to update not found
    return sendError(res, 404, "Category not found");
  }
  if (error.code === "P2002") {
    // Unique constraint violation (duplicate name)
    return sendError(res, 409, "Name already exists");
  }
  throw error; // Unknown error — let it bubble up
}
```

### `findUnique` Returns `null` (Not an Error)

```js
const category = await prisma.category.findUnique({
  where: { id: req.params.id },
});
// category is null if not found — NOT an error!
if (!category) {
  return sendError(res, 404, "Category not found");
}
```

`findUnique` returning `null` is normal. But `update` and `delete` throw P2025 if the record doesn't exist.

---

## 7. Price Snapshot Concept

When an item's price changes, past purchases shouldn't be affected:

```js
// In PurchaseItem, we store unitPrice at time of purchase
const purchaseItem = {
  itemId: item.id,
  quantity: 2,
  unitPrice: 68.00,  // Price when purchased (snapshot)
  totalPrice: 136.00,
};
// Even if item.price later changes to 72.00, this purchase stays at 68.00
```

This is why `PurchaseItem` has its own `unitPrice` field — it's a **snapshot** of the price at the time of purchase.

---

## 8. Summary

| Concept | What You Learned |
|---------|-----------------|
| CRUD mapping | HTTP → SQL → Prisma method mapping |
| Create | `prisma.create()`, FK validation, unique constraints |
| Read | `findMany()` with filters, `findUnique()`, `include` for relations |
| Update | Spread pattern for partial updates, PUT vs PATCH |
| Delete | Pre-delete validation, cascade considerations |
| Error handling | P2002 (duplicate), P2025 (not found), null checks |

**Next Chapter →** CRUD for Item and Customer models, with more complex validation (enums, decimals, multiple foreign keys).
