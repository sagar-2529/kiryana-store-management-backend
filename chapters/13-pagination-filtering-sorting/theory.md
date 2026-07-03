# Chapter 13 — Theory: Pagination, Filtering & Sorting

---

## 1. Why Paginate?

Without pagination, `GET /items` returns ALL items. If you have 10,000 items:
- **Response size:** 5MB+ JSON payload
- **Database load:** Full table scan
- **Client lag:** Rendering 10,000 items freezes the UI

Pagination returns data in manageable chunks: 10, 20, or 50 items per page.

---

## 2. Offset Pagination

```js
// ?page=3&pageSize=10
const skip = (page - 1) * pageSize; // Skip 20 records
const take = pageSize;               // Return 10 records

await prisma.item.findMany({ skip, take });
```

**SQL generated:** `SELECT * FROM items LIMIT 10 OFFSET 20`

| Pros | Cons |
|------|------|
| Simple to implement | Slow on large offsets (page 1000 scans 10,000 rows) |
| Jump to any page | Inconsistent if data changes between pages |
| Total count is easy | Performance degrades linearly with offset |

---

## 3. Cursor Pagination

```js
// ?cursor=last-item-id&pageSize=10
await prisma.item.findMany({
  take: pageSize,
  skip: cursor ? 1 : 0,         // Skip the cursor item itself
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: "desc" },
});
```

**SQL generated:** `SELECT * FROM items WHERE id > 'cursor-id' LIMIT 10`

| Pros | Cons |
|------|------|
| Consistent performance (no offset scan) | No "jump to page N" |
| Handles real-time data well | More complex to implement |
| Used by Twitter, Facebook, etc. | Requires a unique, sortable field |

---

## 4. Response Envelope

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

The `meta` object lets clients build pagination UI (page numbers, next/prev buttons, "showing 11-20 of 150").

---

## 5. Sorting

```
GET /api/v1/items?sort=price:asc,name:desc
```

Parse into Prisma `orderBy`:
```js
function parseSortQuery(sortString, allowedFields) {
  return sortString.split(",").map(part => {
    const [field, direction] = part.split(":");
    if (!allowedFields.includes(field)) return null;
    return { [field]: direction === "desc" ? "desc" : "asc" };
  }).filter(Boolean);
}
// Result: [{ price: "asc" }, { name: "desc" }]
```

**Always whitelist sortable fields** to prevent sorting on internal/sensitive columns.

---

## 6. Dynamic Filtering

```js
const where = {};
if (req.query.categoryId) where.categoryId = req.query.categoryId;
if (req.query.minPrice) where.price = { gte: parseFloat(req.query.minPrice) };
if (req.query.maxPrice) where.price = { ...where.price, lte: parseFloat(req.query.maxPrice) };
```

Each query param conditionally adds to the `where` clause. No params = no filters = return all.

---

## 7. Summary

| Concept | What You Learned |
|---------|-----------------|
| Offset pagination | `skip` + `take`, simple but slow at scale |
| Cursor pagination | Uses last ID, consistent performance |
| Response envelope | `{ data, meta: { total, page, hasNext } }` |
| Sort parsing | `?sort=field:direction` → Prisma `orderBy` |
| Dynamic filters | Build `where` clause from query params |

**Next Chapter →** File uploads with Multer and CSV/PDF exports.
