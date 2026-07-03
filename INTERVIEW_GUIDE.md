# 🎯 Kiryana Store — Interview Preparation Guide

> How to explain every part of this project confidently to an interviewer.
> Format: **What you say** → **What it shows** → **Follow-up Q&A**

---

## 🗣️ Opening Statement (say this first, always)

> *"I built a production-grade REST API for a Kiryana store — a neighbourhood general store. The real problem is that store owners manage hundreds of customers on a credit system using paper registers, which breaks down fast. I digitized that: inventory tracking, cash and credit purchases as atomic database transactions, a full credit ledger, JWT authentication, and pagination. I built it chapter by chapter to learn backend engineering incrementally — from a raw Node.js server all the way to testing and Docker deployment."*

This one paragraph covers: **real problem → solution → tech depth → learning structure.** Interviewers love that you solved a real problem, not just a tutorial app.

---

## Chapter 00 — JavaScript Essentials

### What to say:
> *"Before starting the project, I made sure I deeply understood the JS concepts that power backend code — not just syntax, but why things work. Closures, how promises actually work under the hood, the event loop, and the `this` binding problem. The most important thing I learned was the higher-order function pattern — functions that take or return functions. This is exactly how Express middleware works."*

### Key talking points:
- **Closure:** A function that remembers variables from its outer scope even after that scope is gone. The `asyncHandler` wrapper is a closure — the inner function remembers `fn`.
- **Higher-Order Function:** `asyncHandler(fn)` takes a function and returns a new function. Same pattern as `validate(schema)` middleware factory.
- **Promise vs async/await:** `async/await` is just syntactic sugar over Promises. Under the hood it's the same `.then()` chain.
- **Event Loop:** Why Node can handle thousands of requests on one thread — it never blocks, it delegates I/O and moves on.

### If they ask: *"What is a closure?"*
> *"A closure is when a function retains access to variables from its parent scope even after the parent function has returned. In this project, the `asyncHandler` function returns a new function — that inner function is a closure because it 'closes over' the `fn` parameter. Every time Express calls that route handler, it still has access to `fn`."*

---

## Chapter 01 — Raw Node.js HTTP Server

### What to say:
> *"I started with the raw `http` module — no Express — to understand what frameworks are actually doing for us. You create a server, and for every request you get a `req` object and a `res` object. You have to manually parse the URL, check the method, set headers, serialize JSON, and call `res.end()`. It's verbose, but understanding it makes Express make sense."*

### Key talking points:
- **`req`** is an `IncomingMessage` — has `.method`, `.url`, `.headers`. Body comes as a stream of chunks.
- **`res`** is a `ServerResponse` — you must always call `.end()` or the client hangs.
- **`res.writeHead(200, headers)`** vs **`res.setHeader()`** — `writeHead` sets everything at once and finalises headers. `setHeader` can be called multiple times before that.
- **`res.headersSent`** — a guard property to prevent "headers already sent" crashes.
- **Route dispatch table** — instead of `if/else if`, use an object `{ "GET /path": handler }` for O(1) lookup.

### If they ask: *"Why not just use Express?"*
> *"Using the raw module first shows you what Express is abstracting. When you understand that Express's `req.body` doesn't exist in raw Node — you have to manually collect stream chunks — you appreciate why body-parser middleware exists."*

---

## Chapter 02 — Express Fundamentals

### What to say:
> *"Express is a thin layer over Node's `http` module. It adds three critical things: routing with parameters like `/:id`, automatic body parsing middleware, and the middleware pipeline — a chain of functions where each one can pass control to the next using `next()`."*

### Key talking points:
- **Middleware signature:** `(req, res, next)` — three arguments. Call `next()` to pass control forward, `next(err)` to jump to the error handler.
- **Order matters:** Middleware runs top to bottom. If you put `errorHandler` before routes, errors never reach it.
- **`app.use()` vs `app.get()`:** `use` matches all methods; `get/post/put/delete` match specific ones.
- **`express.json()`:** Without this, `req.body` is `undefined`. It parses the raw stream into a JS object.

### If they ask: *"What is middleware?"*
> *"Middleware is a function that sits between the request and the response. It can read/modify `req`, read/modify `res`, run any logic, and then either end the cycle by sending a response or call `next()` to pass to the next middleware. Error-handling middleware has a special signature with four arguments — `(err, req, res, next)`."*

---

## Chapter 03 — Routing & Controllers (MVC)

### What to say:
> *"I separated the application into three layers: Routes define which URL maps to which function. Controllers handle the HTTP layer — reading `req`, calling a service, sending `res`. Services contain the business logic. This separation means if I swap PostgreSQL for MongoDB tomorrow, I only change the service layer — the controllers and routes stay identical."*

### Key talking points:
- **`express.Router()`** — must be called with parentheses. Returns a mini-Express app you can mount at a prefix.
- **`router.use("/admin", adminRoutes)`** — all routes defined in `adminRoutes` are prefixed with `/admin`.
- **`req.params`** vs **`req.query`** vs **`req.body`**:
  - `params` → `/items/:id` — the `:id` part
  - `query` → `/items?page=2` — query string
  - `body` → `POST` request body

### If they ask: *"What bug did you make here?"*
> *"I wrote `express.Router` without parentheses — that assigns the function itself, not an instance. So when I tried to call `router.post()`, it crashed with 'Cannot read properties of undefined'. Always invoke Router as a function: `express.Router()`."*

---

## Chapter 04 — Prisma ORM & Database

### What to say:
> *"Prisma is a type-safe ORM for Node.js. You define your schema in `schema.prisma`, run `prisma migrate dev`, and it generates both the SQL migration files and a fully-typed client. The key pattern I implemented is the Singleton — one shared `PrismaClient` instance for the entire application. Without this, every `nodemon` restart would create a new connection pool until PostgreSQL ran out of connections."*

### Key talking points:
- **Why UUID over auto-increment?** UUIDs prevent enumeration attacks — attackers can't guess sequential IDs.
- **Singleton pattern:** Store the client on `globalThis` so hot-reloads reuse the existing connection pool.
- **`prisma generate`** — builds the JS client from the schema. Must be run after any schema change.
- **`prisma migrate dev`** — creates a SQL migration file and applies it. For schema changes only, not data.
- **`prisma db seed`** — runs your seed script. For populating data.
- **Prisma Studio** — visual DB explorer at `localhost:5555`.

### If they ask: *"What is the N+1 problem?"*
> *"If you fetch 10 categories and then query each category's products separately, that's 1 + 10 = 11 queries. Prisma solves this with `include: { products: true }` — it does a JOIN in a single query."*

---

## Chapter 05 & 06 — Full CRUD with Relations

### What to say:
> *"These chapters implement full CRUD — Create, Read, Update, Delete — for all models using Prisma. The key concepts here are relation traversal, foreign key validation, and soft vs hard delete. When deleting a Category, I check if it has Products first — if it does, I reject the request rather than cascading the delete, because losing product history would break purchase records."*

### Key Prisma methods to know:
```
findMany()        → SELECT * (with optional filters)
findUnique()      → SELECT WHERE id = ? (returns null if not found)
findFirst()       → SELECT WHERE ... LIMIT 1
create()          → INSERT
update()          → UPDATE WHERE id = ?
delete()          → DELETE WHERE id = ?
createMany()      → Bulk INSERT
```

### If they ask: *"Difference between findUnique and findFirst?"*
> *"`findUnique` only works on fields marked `@unique` or `@id` in the schema. It guarantees at most one result. `findFirst` applies any `where` condition and returns the first match — it's more flexible but doesn't enforce uniqueness."*

---

## Chapter 07 — Middleware Deep Dive

### What to say:
> *"I built three custom middleware: a request logger that times every request, a CORS handler, and the `asyncHandler` wrapper. The most important one is `asyncHandler` — it's a higher-order function that wraps every async route handler. If the async function throws or rejects, it automatically calls `next(error)`, which sends the error to my central error handler."*

### The asyncHandler explained:
```js
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```
- `fn` is your controller function
- Returns a new function (the actual route handler Express calls)
- If `fn` throws, `.catch(next)` forwards the error to Express's error pipeline

### If they ask: *"Why not just use try/catch in every controller?"*
> *"You can, but it's repetitive and error-prone. If you forget `catch(next)` in one controller, async errors silently hang the request. `asyncHandler` enforces the pattern once and makes every controller automatically safe."*

---

## Chapter 08 — Input Validation with Zod

### What to say:
> *"Every POST and PUT request is validated with Zod before it reaches the controller. Zod parses the data, and if anything is invalid — wrong type, missing field, string too short — it throws a structured error with field-level messages. The validate middleware factory takes a schema, runs `safeParse`, and either calls `next()` with clean data or throws a `ValidationError`."*

### Key talking points:
- **Why validate at the boundary?** Controllers should trust that `req.body` is correct. Validation at the route layer enforces this contract.
- **`safeParse` vs `parse`:** `parse` throws on failure. `safeParse` returns `{ success, data, error }` — lets you handle errors gracefully.
- **`z.object().strip()`:** Strips unknown fields, preventing mass-assignment vulnerabilities.

### If they ask: *"Why Zod over Joi?"*
> *"Both are valid. Zod's main advantage is TypeScript-first design — the schema acts as a type definition. Since we're in JS here, it's more about the cleaner API and the `safeParse` pattern. Zod also has smaller bundle size."*

---

## Chapter 09 — Error Handling

### What to say:
> *"I built a custom error class hierarchy. `AppError` extends the native `Error` and adds `statusCode` and `isOperational`. Operational errors are ones we anticipate — like 404 Not Found or 400 Bad Request. Programming errors are bugs. The central error handler distinguishes between them: operational errors send details to the client, programming errors send a generic message so we don't leak stack traces in production."*

### Class hierarchy:
```
Error
  └── AppError (statusCode, isOperational: true)
        ├── NotFoundError     → 404
        ├── ValidationError   → 400
        ├── UnauthorizedError → 401
        └── ForbiddenError    → 403
```

### If they ask: *"Why extend Error instead of just throwing objects?"*
> *"Extending Error gives you the `.stack` property automatically, proper `instanceof` checks, and the `.name` property. Express's error handler checks `instanceof Error`. Throwing plain objects doesn't integrate as cleanly with the error pipeline."*

---

## Chapter 10 — JWT Authentication

### What to say:
> *"Authentication has two parts: registration hashes the password with bcrypt (12 salt rounds) and stores only the hash — never the plain text. Login verifies the password against the hash and, if correct, signs a JWT containing the admin's ID and email. Every protected route runs through an `authenticate` middleware that extracts the token from the Authorization header, verifies it with the secret, and attaches the decoded payload to `req.user`."*

### Key talking points:
- **Why JWT over sessions?** JWT is stateless — the server stores no session data. Scales horizontally without a shared session store.
- **JWT structure:** Header (algorithm) + Payload (claims) + Signature. Only the signature is secret. The payload is base64 encoded, **not encrypted** — don't put sensitive data in it.
- **`exp` claim:** Always set token expiry. A token without expiry is a security liability.
- **bcrypt cost factor (12):** Higher = slower hash = harder to brute-force. 12 is the production sweet spot.

### If they ask: *"What is the difference between authentication and authorization?"*
> *"Authentication answers 'who are you?' — verifying identity with a password and JWT. Authorization answers 'what are you allowed to do?' — checking if the authenticated user has permission for a specific action, like only allowing an admin to delete categories."*

---

## Chapter 11 — Purchase Flow & Transactions

### What to say:
> *"This is the most critical part of the system. A purchase involves multiple database writes — deducting stock from items, creating a purchase record, creating line items, and updating the credit balance if it's a credit sale. All of these must succeed or fail together. I used Prisma's `$transaction` with an interactive callback. If any step throws, Prisma automatically rolls back every change made inside the transaction."*

### Why this matters:
> *"Without a transaction: if the purchase record saves but the stock deduction fails — the store thinks they sold an item but the inventory is unchanged. The data is now inconsistent. With `$transaction`, this is impossible."*

### If they ask: *"What is ACID?"*
> *"ACID stands for Atomicity (all or nothing), Consistency (data stays valid), Isolation (concurrent transactions don't interfere), Durability (committed data survives crashes). PostgreSQL is fully ACID-compliant. This is why we use it for financial data — SQLite or MongoDB without transactions can't give these guarantees."*

---

## Chapter 12 — Credit System & Advanced Queries

### What to say:
> *"The credit system uses a double-entry ledger pattern. You never directly update a balance. Instead, every credit change creates an immutable `CreditTransaction` record — either DEBIT (customer owes more) or CREDIT (customer paid back). The running balance is derived from summing all transactions. This gives a full audit trail and makes it impossible to lose history."*

### Key Prisma features used:
- **`prisma.creditTransaction.groupBy()`** — group transactions by customer, sum amounts
- **`prisma.purchase.aggregate()`** — sum total sales for a date range
- **`prisma.$queryRaw`** — escape hatch for complex SQL Prisma can't express

### If they ask: *"Why not just update the balance directly?"*
> *"If you update a balance field and the update fails midway, you lose the record of what happened. With ledger entries, even if something crashes, you can reconstruct the exact balance from the transaction history. It's how banks work — they never edit a transaction, they create a reversal entry."*

---

## Chapter 13 — Pagination, Filtering & Sorting

### What to say:
> *"Every list endpoint supports pagination, search, and sorting. I implemented offset-based pagination using Prisma's `skip` and `take`. The response always includes a `meta` object with `page`, `pageSize`, `total`, and `totalPages` so the frontend knows how many pages exist."*

### Pagination math:
```js
const skip = (page - 1) * pageSize;  // How many records to skip
const take = pageSize;                // How many to return
// page=1, size=10 → skip=0, take=10
// page=2, size=10 → skip=10, take=10
```

### If they ask: *"Offset vs cursor-based pagination?"*
> *"Offset pagination (`SKIP 20 LIMIT 10`) is simple but slow on large datasets — the DB scans all skipped rows. Cursor-based pagination uses the last seen ID as a marker (`WHERE id > lastId LIMIT 10`) — it's O(1) regardless of page number. For this store's dataset size, offset is fine. At millions of records, cursor is better."*

---

## Chapter 14 — File Upload & Invoice Export

### What to say:
> *"I used Multer to handle file uploads — it parses `multipart/form-data` requests. For exports, I generate CSV by building comma-separated strings and sending them with `Content-Disposition: attachment` so the browser downloads instead of displaying. For PDF invoices, I used a PDF generation library to create structured receipts."*

### If they ask: *"Where do you store uploaded files?"*
> *"In development, Multer stores them on the local filesystem. In production, you'd use cloud storage like AWS S3 — you'd swap the Multer storage engine from `diskStorage` to a cloud adapter. You never store user uploads in your application's directory on a production server."*

---

## Chapter 15 — Rate Limiting, Caching & Security

### What to say:
> *"I added three security layers. First, `helmet` sets security headers automatically — things like `X-Content-Type-Options`, `X-Frame-Options`, and removing the `X-Powered-By` header so attackers can't fingerprint the stack. Second, `express-rate-limit` limits each IP to 100 requests per 15 minutes — prevents brute force and API abuse. Third, an in-memory cache with TTL for frequently read, rarely changed data like category lists."*

### Cache pattern:
```
Request → Check cache → HIT: return cached data (fast)
                      → MISS: query DB → store in cache → return data
Mutation (POST/PUT/DELETE) → Invalidate cache → next GET hits DB
```

### If they ask: *"What's the problem with in-memory cache?"*
> *"It's process-local. If you run two Node processes (horizontal scaling), each has its own cache — they can serve stale data inconsistently. Production solution: Redis, a shared external cache all processes can read/write."*

---

## Chapter 16 — Testing, Logging & Deployment

### What to say:
> *"I added structured logging with Winston — logs have level, timestamp, and message fields and go to both the console and rotating log files. For testing, I used Jest for unit tests and Supertest for integration tests that spin up the actual Express app and make real HTTP requests against it. For deployment, Docker Compose runs PostgreSQL in a container so the setup is reproducible across any machine."*

### If they ask: *"What's the difference between unit and integration tests?"*
> *"Unit tests test a single function in isolation — mock all dependencies. Integration tests test the full stack working together — real Express app, real database. Unit tests are fast and pinpoint failures. Integration tests catch bugs that only appear when components interact."*

### If they ask: *"What is structured logging?"*
> *"Instead of `console.log("User created")`, structured logging outputs JSON: `{ level: "info", message: "User created", userId: "abc", timestamp: "..." }`. This lets log aggregation tools like Datadog or ELK stack parse and query logs — you can search `level=error` or `userId=abc` across millions of log lines."*

---

## 🔥 Hardest Interview Questions — Prepared Answers

**Q: "What would you do differently if you built this again?"**
> *"I'd add Redis from the start instead of in-memory cache for horizontal scalability. I'd also implement refresh tokens alongside JWTs so users don't get logged out when the access token expires. And I'd add request tracing IDs — a UUID added to every request that threads through all log lines, making debugging in production much easier."*

**Q: "How would you scale this to handle 10,000 concurrent users?"**
> *"First, connection pooling with PgBouncer to stop PostgreSQL from being overwhelmed. Second, horizontal scaling with PM2 cluster mode or Kubernetes, with Redis replacing in-memory cache. Third, read replicas for read-heavy endpoints like inventory listing. Fourth, a CDN for static assets and a job queue like Bull for heavy operations like PDF generation."*

**Q: "How do you prevent SQL injection?"**
> *"Prisma uses parameterized queries internally — all values are passed as parameters, never interpolated into SQL strings. This makes SQL injection impossible for standard Prisma queries. For the one place I use `$queryRaw`, Prisma has a template literal syntax that also parameterizes values."*

**Q: "A customer's credit balance is wrong. How do you debug it?"**
> *"Because we use a ledger pattern, I can reconstruct the balance at any point in time by summing all `CreditTransaction` records for that customer. I'd query the transaction history, verify each entry matches a purchase or repayment, and find the discrepancy. The ledger is immutable — the bug is always in the code that creates transactions, not the balance itself."*

---

## 📋 One-Line Summaries (for rapid revision)

| Chapter | One line |
|---------|---------|
| 00 | Closures, HOFs, Promises, and `this` — the JS that powers everything below |
| 01 | Raw Node.js: `res.end()` or the client hangs forever |
| 02 | Express adds routing, body parsing, and the middleware pipeline |
| 03 | MVC: Router → Controller → Service. Swap DB without touching routes |
| 04 | Prisma: schema → migrate → generate → query. Singleton prevents pool exhaustion |
| 05-06 | CRUD: findMany, create, update, delete. `include` for relations |
| 07 | asyncHandler wraps every controller — errors auto-forwarded to errorHandler |
| 08 | Zod validates at the boundary — controllers trust `req.body` is clean |
| 09 | AppError hierarchy: operational errors get details, bugs get "Something went wrong" |
| 10 | bcrypt hashes passwords, JWT proves identity statlessly |
| 11 | `$transaction` — all writes succeed or all rollback. ACID guarantee |
| 12 | Credit ledger: never update balance directly, always write a transaction entry |
| 13 | skip/take for pagination, always return meta with total and totalPages |
| 14 | Multer for uploads, Content-Disposition for downloads, never store in app dir |
| 15 | helmet for headers, rate-limit for abuse, in-memory cache (Redis in prod) |
| 16 | Winston for structured logs, Supertest for integration tests, Docker for reproducibility |
