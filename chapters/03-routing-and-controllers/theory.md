# Chapter 03 — Theory: Routing & Controllers (MVC Pattern)

---

## 1. Why Structure Code?

In Chapter 02, everything lived in one file. Imagine your Kiryana Store grows to handle:
- Categories, Products, Items (inventory)
- Customers, Purchases, Credits (transactions)
- Auth, Reports, Exports (features)

That's **40+ routes** in a single file. Finding a bug in `handleCustomerCreditRepayment` buried in 2000 lines of code is a nightmare.

**Solution:** Split code by **responsibility**. Each file does one thing well.

---

## 2. MVC Architecture

MVC stands for **Model-View-Controller**. It's a design pattern that separates an application into three layers:

```
┌─────────────────────────────────────────────────────┐
│                     CLIENT                          │
│              (Browser, Postman, App)                │
└───────────────────────┬─────────────────────────────┘
                        │  HTTP Request
                        ▼
┌─────────────────────────────────────────────────────┐
│                    ROUTES                           │
│     Defines URL patterns → maps to controllers      │
│     "GET /api/v1/categories → categoryController"   │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                  CONTROLLERS                        │
│     Contains the logic for each route               │
│     Reads req, processes data, sends res            │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│                    MODELS                           │
│     Data layer (database, Prisma, etc.)             │
│     (We add this in Chapter 04)                     │
└─────────────────────────────────────────────────────┘
```

### Why MVC?

| Benefit | Explanation |
|---------|-------------|
| **Separation of concerns** | Routes know URLs; controllers know logic; models know data |
| **Findability** | Bug in category creation? → Open `category.controller.js` |
| **Reusability** | Same controller can be used with different routes |
| **Testability** | Test controllers without running a server |
| **Team collaboration** | Developer A works on categories; Developer B works on customers |

### What About the "View"?

In traditional MVC (like Ruby on Rails), the View renders HTML templates. In API development, there's no View — we send JSON directly. So it's really **MC** (Model-Controller) or sometimes called **MRC** (Model-Route-Controller).

---

## 3. `express.Router()` — Mini Applications

A Router is like a mini Express app that only handles routes. You create it, add routes to it, then mount it on your main app.

### How It Works

```js
// routes/category.routes.js
const express = require("express");
const router = express.Router();

router.get("/", getAll);       // Handles GET /
router.post("/", create);      // Handles POST /
router.get("/:id", getById);   // Handles GET /:id

module.exports = router;
```

```js
// app.js
const categoryRoutes = require("./routes/category.routes");
app.use("/api/v1/categories", categoryRoutes);
// Now router's "/" becomes "/api/v1/categories/"
// And router's "/:id" becomes "/api/v1/categories/:id"
```

### The Prefix Mechanism

When you mount a router with `app.use("/api/v1/categories", router)`:
- The prefix `/api/v1/categories` is **prepended** to every route in the router
- Inside the router, you only define the **relative** paths (`/`, `/:id`)
- This keeps routes DRY — you don't repeat the prefix everywhere

```
app.use("/api/v1/categories", categoryRoutes)
         ↑ prefix              ↑ router

Router's "/"     → "/api/v1/categories"
Router's "/:id"  → "/api/v1/categories/:id"
Router's "/search" → "/api/v1/categories/search"
```

---

## 4. Controllers — The Logic Layer

A controller is a plain JavaScript module that exports handler functions:

```js
// controllers/category.controller.js

const getAll = (req, res) => {
  // Logic: fetch categories, format response
  res.json({ data: categories });
};

const create = (req, res) => {
  // Logic: validate input, create category, send response
  const { name } = req.body;
  // ...
  res.status(201).json({ data: newCategory });
};

module.exports = { getAll, create };
```

### Controller Responsibilities
- ✅ Read data from `req` (params, query, body)
- ✅ Call business logic / database operations
- ✅ Format and send the response via `res`
- ❌ NOT define URL patterns (that's routes' job)
- ❌ NOT directly interact with HTTP server

### Why Separate Routes from Controllers?

**Without separation:**
```js
// routes/category.routes.js — 200 lines of mixed routing + logic
router.get("/", (req, res) => {
  // 50 lines of database queries, validation, error handling...
});
router.post("/", (req, res) => {
  // Another 50 lines...
});
```

**With separation:**
```js
// routes/category.routes.js — 6 lines, crystal clear
router.get("/", controller.getAll);
router.post("/", controller.create);
router.get("/:id", controller.getById);
```

The route file becomes a **table of contents** — you can see every URL the resource supports at a glance.

---

## 5. Folder Structure Deep Dive

```
src/
├── app.js                    ← App configuration (middleware + route mounting)
├── server.js                 ← Entry point (just starts listening)
├── routes/
│   ├── index.js              ← Combines all route modules
│   ├── admin.routes.js       ← Admin-related routes
│   └── category.routes.js    ← Category CRUD routes
├── controllers/
│   ├── admin.controller.js   ← Admin handler functions
│   └── category.controller.js← Category handler functions
└── utils/
    └── response.js           ← Shared response helpers
```

### Why Separate `app.js` and `server.js`?

```js
// app.js — creates and configures the Express app
const app = express();
app.use(express.json());
app.use("/api/v1", routes);
module.exports = app;

// server.js — starts the server
const app = require("./app");
app.listen(3000);
```

**Key benefit:** In Chapter 16 (Testing), you'll import `app` without starting a server:
```js
// test file
const app = require("../src/app");
const request = require("supertest");
const res = await request(app).get("/api/v1/categories"); // No server.listen() needed!
```

If `app.listen()` was in `app.js`, every test file would start a server on the same port — crash!

---

## 6. API Versioning

```js
app.use("/api/v1", routes);
//            ^^
//         version prefix
```

### Why Version Your API?

Imagine 100 mobile apps use your API. You need to change the response format:

**Without versioning:**
```
/api/categories → { name: "Dairy" }
// You change it to:
/api/categories → { categoryName: "Dairy" }
// 💥 All 100 apps break!
```

**With versioning:**
```
/api/v1/categories → { name: "Dairy" }        ← Old apps keep working
/api/v2/categories → { categoryName: "Dairy" } ← New apps use v2
```

You can maintain both versions simultaneously. Old apps don't break. New apps get the improved format.

---

## 7. Route Index Pattern

```js
// routes/index.js
const router = express.Router();
router.use("/admin", adminRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
module.exports = router;
```

The index file acts as a **central registry** of all route groups. When you add a new resource, you:
1. Create `routes/newResource.routes.js`
2. Create `controllers/newResource.controller.js`
3. Add one line to `routes/index.js`

### Nested Mounting

```
app.use("/api/v1", indexRouter)
                    └── router.use("/categories", categoryRouter)
                                                  └── router.get("/", getAll)

Final URL: GET /api/v1/categories/
Prefixes:  /api/v1 + /categories + /
```

---

## 8. Response Helpers

```js
// utils/response.js
function sendSuccess(res, statusCode, data, message) {
  const response = { success: true };
  if (message) response.message = message;
  if (data !== undefined) response.data = data;
  return res.status(statusCode).json(response);
}

function sendError(res, statusCode, message) {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
}
```

### Why Standardise Responses?

Every API response should follow a consistent format. Without helpers:
```js
// Controller A
res.json({ items: data, count: 5 });

// Controller B
res.json({ result: data, total: 5 });

// Controller C
res.json({ data: data });
```

Three different response shapes! The client has to handle each one differently. With helpers, every response looks the same:
```json
{ "success": true, "data": [...], "message": "Created" }
{ "success": false, "error": "Not found" }
```

---

## 9. Code Walkthrough: Key Patterns

### Duplicate Check Before Insert
```js
if (categories.find((c) => c.name.toLowerCase() === name.toLowerCase())) {
  return sendError(res, 409, `Category '${name}' already exists`);
}
```
**Why?** The 409 Conflict status code tells the client this exact resource already exists. In Chapter 05, the database's unique constraint handles this automatically (Prisma error P2002).

### Partial Update Pattern
```js
if (name !== undefined) categories[index].name = name;
if (description !== undefined) categories[index].description = description;
```
**Why `!== undefined`?** The client might send `{ "description": null }` to explicitly clear the description. Using `if (description)` would skip `null` values. Using `!== undefined` only skips truly omitted fields.

### `module.exports` Styles
```js
// Object of named functions (preferred for controllers)
module.exports = { getAll, getById, create, update, remove };

// Single export (preferred for middleware, utilities)
module.exports = router;
```

---

## 10. Summary

| Concept | What You Learned |
|---------|-----------------|
| MVC | Model-View-Controller architecture pattern |
| `express.Router()` | Mini-app for grouping related routes |
| Route prefixes | Mount routers at paths: `/api/v1/categories` |
| Controllers | Functions that contain route handler logic |
| Folder structure | `routes/`, `controllers/`, `utils/` separation |
| `app.js` vs `server.js` | Configuration vs startup — enables testing |
| API versioning | `/api/v1/` prefix for backward compatibility |
| Response helpers | Consistent `{ success, data, error }` format |

**Next Chapter →** We connect to a real PostgreSQL database using Prisma ORM, replacing our in-memory arrays with persistent storage.
