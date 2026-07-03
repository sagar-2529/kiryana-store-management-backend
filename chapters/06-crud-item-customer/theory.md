# Chapter 06 — Theory: CRUD with Complex Models (Item & Customer)

---

## 1. Multiple Foreign Keys

The `Item` model has TWO foreign keys: `productId` and `categoryId`. This means you must validate both exist before creating an item.

```prisma
model Item {
  productId  String
  categoryId String
  product    Product  @relation(fields: [productId], references: [id])
  category   Category @relation(fields: [categoryId], references: [id])
}
```

### Cross-Validation

```js
if (product.categoryId !== categoryId) {
  throw new Error("Product doesn't belong to this category");
}
```

An item's product and category must be consistent. "Amul Gold 1L" belongs to product "Milk" in category "Dairy". Creating it under "Grains" would be a data integrity error.

---

## 2. Enums in APIs

Prisma enums map to database enums and JavaScript strings:

```prisma
enum UnitType {
  KG
  GRAM
  LITRE
  // ...
}
```

### Client sends the enum value as a string:
```json
{ "unitType": "KG" }
```

### Validation
```js
const VALID_UNIT_TYPES = ["KG", "GRAM", "LITRE", "ML", "PIECE", ...];
if (!VALID_UNIT_TYPES.includes(unitType)) {
  return sendError(res, 400, `Invalid unitType. Must be one of: ${VALID_UNIT_TYPES.join(", ")}`);
}
```

Prisma would reject invalid values anyway, but validating early gives a clearer error message.

---

## 3. Decimal Fields

The `price` and `stock` fields use `Decimal` type:

```prisma
price Decimal @db.Decimal(10, 2)  // 99999999.99 max
stock Decimal @db.Decimal(10, 3)  // 9999999.999 max (for KG fractions)
```

### Why Decimal, Not Float?

```
Float:   0.1 + 0.2 = 0.30000000000000004  ❌
Decimal: 0.1 + 0.2 = 0.3                   ✅
```

**Floats** use binary representation. They can't represent `0.1` exactly, leading to rounding errors. In financial systems (like our store), ₹45.50 must be exactly ₹45.50 — not ₹45.49999999.

### JSON Serialisation

Prisma returns `Decimal` objects which serialise as **strings** in JSON:
```json
{ "price": "45.50", "stock": "12.500" }
```

This is intentional — JSON numbers can't guarantee precision for all decimal values.

---

## 4. Query Filters from URL Parameters

```js
const where = {};
if (req.query.categoryId) where.categoryId = req.query.categoryId;
if (req.query.unitType) where.unitType = req.query.unitType;
if (req.query.name) {
  where.name = { contains: req.query.name, mode: "insensitive" };
}
```

### Dynamic Where Clause Building

This pattern conditionally adds filters. If no query params are provided, `where` stays `{}` and all records are returned. Each param narrows the results:

```
GET /api/v1/items                    → All items
GET /api/v1/items?unitType=KG        → Items sold by KG
GET /api/v1/items?categoryId=abc     → Items in category "abc"
GET /api/v1/items?name=sugar&unitType=KG → KG items with "sugar" in name
```

---

## 5. The Null Customer Pattern

For the Kiryana Store, a `null` customerId on a Purchase means an anonymous cash sale:

```js
// Cash customer — no loyalty tracking
const purchase = { customerId: null, paymentType: "CASH" };

// Known customer — track their purchases and credit
const purchase = { customerId: "uuid-123", paymentType: "CREDIT" };
```

This is a deliberate design decision: we still record cash purchases for financial reporting (daily sales, inventory tracking) even though we don't know the customer.

---

## 6. Denormalised Fields

```prisma
model PurchaseItem {
  customerId String?  // denormalised for quick customer-history queries
}
```

`customerId` also exists on `Purchase`. So why duplicate it on `PurchaseItem`?

**Performance.** To get "all items customer X ever bought," without denormalisation:
```sql
SELECT pi.* FROM purchase_items pi
JOIN purchases p ON pi.purchase_id = p.id
WHERE p.customer_id = 'X';  -- Requires a JOIN
```

With denormalisation:
```sql
SELECT * FROM purchase_items WHERE customer_id = 'X';  -- Direct, no JOIN
```

**Trade-off:** Data redundancy (customerId stored twice) for query speed. Acceptable when the field rarely changes (a purchase's customer never changes after creation).

---

## 7. Customer Balance Field

```prisma
model Customer {
  balance Decimal @default(0)  // outstanding credit
}
```

This is another denormalised field. The "true" balance could be calculated by summing all `CreditTransaction` records. But:
- That calculation is expensive on every request
- The balance is needed frequently (every purchase, every report)
- So we maintain it as a running total, updated atomically in transactions

---

## 8. Summary

| Concept | What You Learned |
|---------|-----------------|
| Multiple FKs | Validate both foreign keys + cross-validate consistency |
| Enums | Send/receive as strings, validate against allowed values |
| Decimals | Use for money/quantities, serialise as strings |
| Dynamic filters | Build `where` clause from query parameters |
| Null customer | Anonymous cash purchases with `customerId: null` |
| Denormalisation | Duplicate data for query performance |

**Next Chapter →** Middleware — the backbone of Express that processes every request before it reaches your controllers.
