# Chapter 13 — Pagination, Filtering & Sorting 🔴

## What You'll Learn
- Offset pagination vs Cursor pagination (trade-offs)
- Building reusable pagination utilities
- Dynamic `where` clause building
- Sort query parsing (`?sort=name:asc,createdAt:desc`)
- Response envelopes with metadata

## Key Concepts

### Offset Pagination
```js
// ?page=2&pageSize=10
const skip = (page - 1) * pageSize;
const data = await prisma.item.findMany({ skip, take: pageSize });
```
**Pros:** Simple, "jump to page N" is easy.
**Cons:** Slow on large datasets (DB scans skipped rows).

### Cursor Pagination
```js
// ?cursor=abc123&pageSize=10
const data = await prisma.item.findMany({
  take: pageSize,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
});
```
**Pros:** Consistent performance even on millions of rows.
**Cons:** No "jump to page N" — only next/previous.

### Response Envelope
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 150,
    "page": 2,
    "pageSize": 10,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": true
  }
}
```

## How to Run

```bash
cd chapters/13-pagination-filtering-sorting
npm install
npm run dev
```

---

## 🏠 Homework

1. **Paginate Customers** — Apply pagination + sorting to the customers list.
2. **Paginate Purchases** — Apply pagination to purchases list.
3. **Search Endpoint** — `GET /api/v1/items/search?q=sugar` using `contains`.
