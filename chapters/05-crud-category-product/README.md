# Chapter 05 — CRUD: Category & Product 🟡

## What You'll Learn
- Full CRUD operations with Prisma on real models
- Relation includes (`include: { products: true }`)
- Prisma error codes and handling (P2002, P2025)
- Cascading delete considerations
- API testing workflow

## Key Concepts

### Prisma CRUD Methods
| Method | SQL Equivalent | Usage |
|--------|---------------|-------|
| `create()` | INSERT | Create one record |
| `findMany()` | SELECT * | Get multiple records |
| `findUnique()` | SELECT ... WHERE id = | Get one by unique field |
| `update()` | UPDATE ... WHERE | Update one record |
| `delete()` | DELETE ... WHERE | Delete one record |
| `count()` | SELECT COUNT(*) | Count records |

### Relation Loading
```js
// Include related data (like SQL JOIN)
prisma.category.findUnique({
  where: { id },
  include: { products: true }  // Loads all products in this category
});

// Count related records without loading them
prisma.category.findMany({
  include: {
    _count: { select: { products: true } }
  }
});
```

### Prisma Error Codes
| Code | Meaning | HTTP Status |
|------|---------|-------------|
| P2002 | Unique constraint violation | 409 Conflict |
| P2025 | Record not found | 404 Not Found |
| P2003 | Foreign key constraint failure | 400 Bad Request |

## Folder Structure

```
src/
├── app.js
├── server.js
├── lib/prisma.js
├── utils/response.js
├── routes/
│   ├── index.js
│   ├── category.routes.js
│   └── product.routes.js
└── controllers/
    ├── category.controller.js   ← FULL CRUD (learn from this)
    └── product.controller.js    ← PARTIAL (complete as homework)
```

## How to Run

```bash
cd chapters/05-crud-category-product
npm install
# Copy .env from chapter 04 or root project
npm run dev
```

---

## 🏠 Homework

1. **Complete Product CRUD** — 3 missing routes in `product.controller.js`:
   - `GET    /api/v1/products/:id` — include items with `include: { items: true, category: true }`
   - `PUT    /api/v1/products/:id` — update name and/or description, handle P2025
   - `DELETE /api/v1/products/:id` — check for linked items before deleting

2. **Test with Postman/Thunder Client** — Create a collection with all Category and Product routes. Save it for future chapters.

3. **Add `include: { items: true }`** when fetching a single product by ID.

---

## 💡 Tips
- Study the Category controller carefully — the Product homework follows the same patterns
- Always handle Prisma error codes (P2002, P2025) instead of returning generic 500 errors
- Use `_count` when you just need to know "how many?" without loading all the data
