# 🏪 Kiryana Store — Backend Engineering Project

> A production-grade REST API for managing a general store's inventory, sales, and credit system. Built as a structured 17-chapter curriculum to master backend engineering from the ground up.

---

## 📌 Table of Contents

1. [The Real Problem This Solves](#1-the-real-problem-this-solves)
2. [Tech Stack](#2-tech-stack)
3. [Database Design](#3-database-design)
4. [API Architecture](#4-api-architecture)
5. [Customer Purchase Flow](#5-customer-purchase-flow)
6. [Key Backend Concepts Implemented](#6-key-backend-concepts-implemented)
7. [Project Structure](#7-project-structure)
8. [Chapter-by-Chapter Curriculum](#8-chapter-by-chapter-curriculum)
9. [How to Run](#9-how-to-run)
10. [Quick Revision — Core Patterns](#10-quick-revision--core-patterns)

---

## 1. The Real Problem This Solves

Every neighbourhood Kiryana (general) store in India runs on **trust and credit**. The owner knows hundreds of customers by name, lets them buy on credit, and manually tracks what they owe in a notebook. This breaks down fast:

- A customer buys ₹200 of goods on credit. The owner writes it in a register.
- The customer repays ₹100 two weeks later. The owner updates the register.
- At the end of the month, the owner can't tell who owes what — the notebook is full of crossed-out numbers.

**This API solves that.** It provides:

| Problem | Solution |
|---------|----------|
| Who owes how much? | Real-time credit balance per customer |
| What did they buy? | Full purchase history with itemised receipts |
| Is stock running low? | Live inventory tracking, deducted on every sale |
| Cash vs Credit sales | Two payment modes with atomic transaction recording |
| How much did I earn today? | Aggregated daily/weekly purchase reports |

---

## 2. Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Runtime** | Node.js (v20+) | Non-blocking I/O, great for API servers |
| **Framework** | Express.js | Minimal, unopinionated, industry-standard |
| **ORM** | Prisma v7 | Type-safe queries, auto-migrations, Prisma Studio |
| **Database** | PostgreSQL | ACID transactions — critical for financial data |
| **Auth** | JWT (jsonwebtoken) | Stateless authentication, no session storage needed |
| **Validation** | Zod | Runtime type validation with clear error messages |
| **Password** | bcryptjs | Industry-standard one-way hashing |
| **Security** | helmet, express-rate-limit, hpp | Production security headers |
| **Logging** | Winston | Structured logs, file + console transports |
| **Testing** | Jest + Supertest | Unit and integration tests |
| **DevOps** | Docker + Docker Compose | Containerised PostgreSQL for local dev |

---

## 3. Database Design

The schema has **8 models** with carefully designed relationships:

```
Admin
  └── Category (one Admin → many Categories)
        └── Product (one Category → many Products)
              └── Item / SKU (one Product → many Items with price/stock)

Customer
  └── Purchase (one Customer → many Purchases)
        └── PurchaseItem (each Purchase → many line items)
  └── UserCredit (one Customer → one credit balance record)
        └── CreditTransaction (full ledger of every credit change)
```

### Model Summary

| Model | Table | Purpose |
|-------|-------|---------|
| `Admin` | `admins` | Store owner account |
| `Category` | `categories` | Product groupings (Dairy, Grains, etc.) |
| `Product` | `products` | Product types (Milk, Rice, etc.) |
| `Item` | `items` | Purchasable SKUs with price and stock |
| `Customer` | `customers` | Store customers |
| `Purchase` | `purchases` | A single sales transaction |
| `PurchaseItem` | `purchase_items` | Line items within a purchase |
| `UserCredit` | `user_credits` | Running credit balance per customer |
| `CreditTransaction` | `credit_transactions` | Immutable ledger of all credit changes |

### Key Design Decisions

**Why UUIDs instead of auto-increment IDs?**
UUIDs prevent enumeration attacks (`/api/users/1`, `/api/users/2`...). An attacker can't guess IDs.

**Why a separate `CreditTransaction` table?**
Double-entry bookkeeping principle. You never update a balance directly — you record a transaction (+/−) and compute the balance from the ledger. This gives a full audit trail and makes reconciliation possible.

**Why `Item` is separate from `Product`?**
A `Product` (e.g., "Milk") can have multiple `Items` (SKUs): "Amul Taza 1L at ₹68" and "Amul Gold 500ml at ₹38". This models how real stores stock the same product in different sizes/brands.

---

## 4. API Architecture

### URL Structure
```
/api/v1/{resource}
```

All routes are versioned (`v1`) so future breaking changes can live at `/api/v2` without breaking existing clients.

### MVC Pattern
```
Request → Router → Controller → Service → Prisma → PostgreSQL
                                              ↑
                                        (Business logic
                                         lives in Service)
```

| Layer | Responsibility |
|-------|---------------|
| **Router** | Maps URL + HTTP method to the right controller |
| **Controller** | Reads `req`, calls service, sends `res` |
| **Service** | Contains all business logic and database queries |
| **Prisma** | Translates service calls into SQL |

### Middleware Stack (applied in order)
```js
app.use(helmet())           // 1. Security headers
app.use(cors())             // 2. Cross-origin requests
app.use(requestLogger)      // 3. Log every request
app.use(express.json())     // 4. Parse JSON body
app.use(rateLimiter)        // 5. Throttle requests
app.use("/api/v1", routes)  // 6. Route handling
app.use(errorHandler)       // 7. Centralised error response
```

**Order matters.** If you put `errorHandler` before routes, errors from routes won't reach it.

---

## 5. Customer Purchase Flow

This is the most complex and important part of the system. Every purchase is an **atomic database transaction** — either everything succeeds or nothing changes.

### Flow Diagram

```
Customer arrives at store
         │
         ▼
   Cash or Credit?
    ┌────┴────┐
  Cash      Credit
    │       ┌────┴────┐
    │    Existing   New
    │    Customer  Customer
    │       │          │
    │       │     Create customer
    │       │     & credit record
    │       └────┬────┘
    └────────────┘
         │
         ▼
  Select items + quantities
         │
         ▼
  ┌─ Prisma Transaction ──────────────────┐
  │  1. Validate stock for each item       │
  │  2. Deduct stock from items            │
  │  3. Create Purchase record             │
  │  4. Create PurchaseItem records        │
  │  5. If credit: update UserCredit       │
  │  6. If credit: create CreditTransaction│
  └────────────────────────────────────────┘
         │
         ▼
  Return receipt to client
```

### Why Prisma `$transaction`?

Without a transaction, if step 3 (create Purchase) succeeds but step 4 (deduct stock) fails — you've recorded a sale but the inventory is wrong. The `$transaction` callback guarantees **all-or-nothing**:

```js
const result = await prisma.$transaction(async (tx) => {
  // All db calls inside use `tx` not `prisma`
  // If any throw, ALL changes are rolled back automatically
  await tx.item.update(...)        // Deduct stock
  const purchase = await tx.purchase.create(...)
  await tx.purchaseItem.createMany(...)
  if (creditPayment > 0) {
    await tx.userCredit.update(...)
    await tx.creditTransaction.create(...)
  }
  return purchase;
});
```

---

## 6. Key Backend Concepts Implemented

### JWT Authentication (Chapter 10)
```
Login → Verify password → Sign JWT → Return token
Every protected route → Verify token → Attach user to req → Continue
```
JWT payload contains `{ adminId, email, iat, exp }`. The secret lives in `.env` — never hardcoded.

### Zod Validation (Chapter 08)
Every `POST`/`PUT` request is validated before hitting the controller:
```js
const schema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().positive(),
});
// Invalid input → 400 error with field-level messages
// Valid input → controller runs
```

### Custom Error Classes (Chapter 09)
```
Error
  └── AppError (base: statusCode, isOperational)
        ├── NotFoundError     (404)
        ├── ValidationError   (400)
        ├── UnauthorizedError (401)
        └── ForbiddenError    (403)
```
One central `errorHandler` middleware catches all thrown errors and sends a consistent JSON response.

### asyncHandler Pattern (Chapter 07)
Wraps every async controller so you never need `try/catch` in route handlers:
```js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
// If fn throws, error goes to next() → errorHandler
```

### Pagination (Chapter 13)
Every list endpoint supports:
```
GET /api/v1/items?page=2&pageSize=10&sortBy=price&sortOrder=desc&search=milk
```
Response always includes:
```json
{
  "data": [...],
  "meta": { "page": 2, "pageSize": 10, "total": 47, "totalPages": 5 }
}
```

### Rate Limiting (Chapter 15)
```js
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window per IP
});
```
Prevents brute force attacks on login and API abuse.

### In-Memory Cache (Chapter 15)
Category and product lists (which change infrequently) are cached:
```
First request → DB query → Store in cache (TTL: 60s) → Return data
Next request  → Cache hit → Return data instantly (no DB query)
On mutation   → Invalidate cache → Next request hits DB again
```

---

## 7. Project Structure

```
kiryana_store/
├── prisma/
│   ├── schema.prisma       # Database models and relations
│   ├── seed.js             # Development data seeder
│   └── migrations/         # Auto-generated SQL migration files
│
├── prisma.config.ts        # Prisma 7 config (datasource URL, seed command)
│
├── chapters/               # Learning curriculum (each is a standalone project)
│   ├── 00-javascript-essentials/    # Closures, Promises, Classes, asyncHandler
│   ├── 01-hello-node-server/        # Raw http module, manual routing
│   ├── 02-express-fundamentals/     # Express basics, in-memory CRUD
│   ├── 03-routing-and-controllers/  # MVC structure, multiple routers
│   ├── 04-prisma-orm-basics/        # ORM intro, migrations, Prisma Studio
│   ├── 05-crud-category-product/    # Full Prisma CRUD for Category & Product
│   ├── 06-crud-item-customer/       # CRUD with relations and query filters
│   ├── 07-middleware-deep-dive/     # Custom middleware, request lifecycle
│   ├── 08-input-validation/         # Zod schemas, validate middleware
│   ├── 09-error-handling/           # Custom error classes, central handler
│   ├── 10-authentication-jwt/       # bcrypt, JWT sign/verify, auth middleware
│   ├── 11-purchase-flow-transactions/ # Atomic transactions, inventory logic
│   ├── 12-credit-system-advanced-queries/ # Credit ledger, Prisma aggregates
│   ├── 13-pagination-filtering-sorting/   # Cursor & offset pagination
│   ├── 14-file-upload-invoice-export/     # Multer, PDF/CSV generation
│   ├── 15-rate-limiting-caching-security/ # helmet, rate-limit, hpp, cache
│   └── 16-testing-logging-deployment/    # Jest, Supertest, Winston, Docker
│
├── docker-compose.yaml     # PostgreSQL container for local dev
└── package.json            # Root workspace config
```

Each chapter folder contains:
```
chapter-XX/
├── theory.md      # Deep-dive explanation of the concepts
├── README.md      # What to learn, homework tasks
├── package.json   # Chapter's own dependencies
└── src/
    ├── server.js          # Entry point
    ├── app.js             # Express app config
    ├── routes/            # Route definitions
    ├── controllers/       # Request handlers
    ├── services/          # Business logic
    ├── middleware/        # Custom middleware
    ├── validations/       # Zod schemas
    ├── utils/             # Helpers (response, pagination)
    └── lib/
        └── prisma.js      # Singleton PrismaClient
```

---

## 8. Chapter-by-Chapter Curriculum

| # | Chapter | Core Concept | Key File |
|---|---------|-------------|----------|
| 00 | JavaScript Essentials | Closures, HOFs, Promises, Classes | `examples.js` |
| 01 | Hello Node Server | `http.createServer`, `req`/`res` lifecycle | `server.js` |
| 02 | Express Fundamentals | Middleware, routing, body parsing | `server.js` |
| 03 | Routing & Controllers | MVC separation, `express.Router()` | `routes/index.js` |
| 04 | Prisma ORM Basics | Schema, migrations, Studio, seeding | `lib/prisma.js` |
| 05 | CRUD Category & Product | `findMany`, `create`, `update`, `delete` | `category.controller.js` |
| 06 | CRUD Item & Customer | Relations, `include`, query filters | `item.controller.js` |
| 07 | Middleware Deep Dive | `asyncHandler`, request timing, CORS | `requestLogger.js` |
| 08 | Input Validation | Zod schemas, validation middleware | `schemas.js` |
| 09 | Error Handling | `AppError` hierarchy, central handler | `errors.js` |
| 10 | Authentication JWT | bcrypt, `jwt.sign`/`verify`, protect middleware | `auth.js` |
| 11 | Purchase Flow | `$transaction`, stock deduction, receipts | `purchase.service.js` |
| 12 | Credit System | Ledger pattern, aggregates, `groupBy` | `credit.service.js` |
| 13 | Pagination & Filtering | `skip`/`take`, `where`, `orderBy`, meta | `pagination.js` |
| 14 | File Upload & Export | Multer, PDF invoices, CSV export | `multer.js` |
| 15 | Rate Limiting & Caching | `express-rate-limit`, in-memory TTL cache | `cache.js` |
| 16 | Testing & Deployment | Jest, Supertest, Winston, Docker | `logger.js` |

---

## 9. How to Run

### Prerequisites
- Node.js 20+
- Docker Desktop (for PostgreSQL)

### Setup

```bash
# 1. Clone and install root dependencies
cd kiryana_store
npm install

# 2. Start PostgreSQL via Docker
cd chapters/04-prisma-orm-basics
docker-compose up -d

# 3. Set up environment
cp .env.example .env
# Edit .env and set DATABASE_URL=postgresql://user:password@localhost:5432/kiryana_store

# 4. Run migrations (creates all tables)
cd /path/to/kiryana_store
npx prisma migrate dev --name "init"

# 5. Seed development data
npx prisma db seed

# 6. Open Prisma Studio (visual DB explorer)
npx prisma studio

# 7. Start any chapter's server
cd chapters/10-authentication-jwt
npm install
npm run dev
```

### Key URLs
| Service | URL |
|---------|-----|
| API Server | `http://localhost:3000` |
| Prisma Studio | `http://localhost:5555` |

### Example API Calls
```bash
# Register admin
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Store Owner","email":"owner@store.com","password":"secret123"}'

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -d '{"email":"owner@store.com","password":"secret123"}'

# Get all categories (with JWT)
curl http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer <your_token>"

# Create a purchase
curl -X POST http://localhost:3000/api/v1/purchases \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "uuid-here",
    "paymentMode": "CREDIT",
    "items": [
      { "itemId": "uuid-here", "quantity": 2 }
    ]
  }'
```

---

## 10. Quick Revision — Core Patterns

### The asyncHandler — why every controller uses it
```js
// Without asyncHandler — you must write try/catch everywhere
router.get("/:id", async (req, res, next) => {
  try {
    const item = await prisma.item.findUnique(...);
    res.json({ data: item });
  } catch (err) {
    next(err); // Must remember to do this
  }
});

// With asyncHandler — errors automatically forwarded to errorHandler
router.get("/:id", asyncHandler(async (req, res) => {
  const item = await prisma.item.findUnique(...);
  res.json({ data: item });
}));
```

### The PrismaClient Singleton — why it matters
```js
// BAD — creates a new connection pool on every import
const prisma = new PrismaClient();

// GOOD — reuses the same instance across all files
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
module.exports = prisma;
```
Without this, `nodemon` restarts create new connection pools until PostgreSQL runs out of connections.

### Validation Middleware — keeping controllers clean
```js
// middleware/validate.js
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) throw new ValidationError(result.error.flatten());
  req.body = result.data; // Cleaned + typed data
  next();
};

// Usage in route
router.post("/", validate(categorySchema), categoryController.create);
// Controller now receives validated data — no manual checks needed
```

### Atomic Purchase Transaction — the most critical pattern
```js
const purchase = await prisma.$transaction(async (tx) => {
  // 1. Check and deduct stock for each item
  for (const { itemId, quantity } of items) {
    const item = await tx.item.findUnique({ where: { id: itemId } });
    if (item.stock < quantity) throw new ValidationError("Insufficient stock");
    await tx.item.update({
      where: { id: itemId },
      data: { stock: { decrement: quantity } },
    });
  }
  // 2. Record the purchase
  const purchase = await tx.purchase.create({ data: { ... } });
  // 3. If credit, update balance and write ledger entry
  if (creditAmount > 0) {
    await tx.userCredit.update({ data: { balance: { increment: creditAmount } } });
    await tx.creditTransaction.create({ data: { type: "DEBIT", amount: creditAmount } });
  }
  return purchase;
});
// If anything above throws → ALL changes rollback. Database stays consistent.
```

### Central Error Handler — one place for all error responses
```js
// The last middleware in app.js
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational || false;

  // Operational errors (our AppError subclasses) → send details to client
  // Programming errors (bugs) → send generic "Internal Server Error"
  res.status(statusCode).json({
    success: false,
    error: isOperational ? err.message : "Something went wrong",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});
```

---

## Credits

Built as a self-directed backend engineering curriculum. Each chapter is a fully runnable Node.js project with a `theory.md` explaining the "why" behind every design decision — not just the "how".

The goal: deeply understand what frameworks like Express and ORMs like Prisma are doing under the hood, so you can debug, optimise, and architect production systems with confidence.
