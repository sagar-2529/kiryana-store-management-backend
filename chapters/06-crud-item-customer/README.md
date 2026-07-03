# Chapter 06 — CRUD: Item & Customer 🟡

## What You'll Learn
- CRUD for models with multiple foreign keys (Item → Product + Category)
- Query filtering with Prisma `where` clause
- Enum handling (`UnitType`) in API requests
- Decimal field serialisation in JSON responses
- Denormalised fields and when to use them

## Key Concepts

### 1. Foreign Key Validation
Before creating an Item, we must verify both `productId` and `categoryId` exist:
```js
const product = await prisma.product.findUnique({ where: { id: productId } });
if (!product) return sendError(res, 400, "Product not found");
```

### 2. Enum Values in API
Prisma enums map directly. The client sends the enum string value:
```json
{ "unitType": "KG" }
```
Valid values: `KG`, `GRAM`, `LITRE`, `ML`, `PIECE`, `DOZEN`, `PACKET`, `BOX`, `BOTTLE`, `OTHER`

### 3. Decimal Fields
Prisma returns `Decimal` objects, which serialise to strings in JSON. This is intentional for precision. `"45.00"` not `45`.

### 4. Query Filters
```js
const where = {};
if (req.query.categoryId) where.categoryId = req.query.categoryId;
if (req.query.unitType) where.unitType = req.query.unitType;
// GET /api/v1/items?categoryId=abc&unitType=KG
```

## How to Run

```bash
cd chapters/06-crud-item-customer
npm install
npm run dev
```

---

## 🏠 Homework

1. **Complete Customer CRUD** — 3 missing routes:
   - `GET    /api/v1/customers/:id` — include purchases, userCredit, and balance
   - `PUT    /api/v1/customers/:id` — update name, phone, address
   - `DELETE /api/v1/customers/:id` — prevent if customer has outstanding balance (`balance > 0`)

2. **`GET /api/v1/customers/:id/purchases`** — Return all purchases for a specific customer with purchase items included.

3. **Stock Validation** — In the Item update route, add validation: stock cannot be set to a negative number.
