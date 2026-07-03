# Chapter 02 — Theory: Express.js Fundamentals

---

## 1. What is Express.js?

Express.js is a **minimal, unopinionated web framework** for Node.js. It wraps the raw `http` module and provides:
- Clean routing API (`app.get()`, `app.post()`)
- Middleware system (plugins that process requests)
- Request/response helpers (`req.body`, `res.json()`)
- Error handling infrastructure

### Why Not Just Use Raw `http`?

| Task | Raw Node.js | Express |
|------|------------|---------|
| Parse JSON body | 8+ lines of event handling | `app.use(express.json())` — one line |
| Route matching | Manual string comparison | `app.get('/users/:id', handler)` |
| Send JSON response | `res.writeHead` + `res.end(JSON.stringify)` | `res.json(data)` |
| URL parameters | Manual regex parsing | `req.params.id` |
| Query strings | Manual `URL` parsing | `req.query.page` |
| Error handling | `try/catch` everywhere | Central error middleware |

Express doesn't add unnecessary complexity — it removes boilerplate while keeping you in control.

### Real-World Usage
Express is the most popular Node.js framework with **64,000+ GitHub stars** and **30 billion+ npm downloads**. Used by IBM, Accenture, Uber, and countless startups.

---

## 2. `express()` — The Application Factory

```js
const express = require("express");
const app = express();
```

`express()` creates an Application object. This object is the central hub:
- You attach routes to it: `app.get()`, `app.post()`
- You attach middleware to it: `app.use()`
- You start the server from it: `app.listen()`

**Under the hood:** The `app` object is actually a function — it's a request handler that can be passed to `http.createServer()`. Express does this internally when you call `app.listen()`.

---

## 3. Built-in Middleware

### `express.json()`
```js
app.use(express.json());
```

**What it does:**
1. Intercepts incoming requests that have `Content-Type: application/json`
2. Reads the raw body stream (just like we did manually in Chapter 01)
3. Parses the JSON string into a JavaScript object
4. Attaches the result to `req.body`

**Without it:** `req.body` is `undefined`. This is the #1 beginner mistake.

**How it works internally:**
```
Client sends: POST /api/items
Headers: Content-Type: application/json
Body: {"name": "Sugar", "price": 45}

→ express.json() middleware runs:
  1. Checks Content-Type header → matches "application/json"
  2. Reads raw bytes from request stream
  3. Calls JSON.parse() on the string
  4. Sets req.body = { name: "Sugar", price: 45 }
  5. Calls next() to pass to the next middleware/route
```

### `express.urlencoded({ extended: true })`
```js
app.use(express.urlencoded({ extended: true }));
```

Parses form data (from HTML `<form>` submissions). The `extended: true` option uses the `qs` library which supports nested objects; `false` uses Node's built-in `querystring` which is simpler.

---

## 4. Request Object — Enriched by Express

Express adds powerful properties to the raw `req` object:

### `req.params` — URL Parameters
```js
// Route: /api/items/:id
// Request: GET /api/items/42

app.get("/api/items/:id", (req, res) => {
  console.log(req.params.id); // "42" (always a string!)
});
```

The `:id` syntax defines a **named parameter**. Express extracts the value from the URL and puts it in `req.params`.

Multiple params work too:
```js
// Route: /api/categories/:catId/products/:prodId
app.get("/api/categories/:catId/products/:prodId", (req, res) => {
  console.log(req.params.catId);  // "5"
  console.log(req.params.prodId); // "12"
});
```

### `req.query` — Query String Parameters
```js
// Request: GET /api/items?name=sugar&unit=kg&page=2

app.get("/api/items", (req, res) => {
  console.log(req.query.name); // "sugar"
  console.log(req.query.unit); // "kg"
  console.log(req.query.page); // "2" (always a string!)
});
```

Query parameters are optional and used for filtering, searching, pagination.

### `req.body` — Parsed Request Body
```js
// Request: POST /api/items
// Body: { "name": "Sugar", "price": 45 }

app.post("/api/items", (req, res) => {
  console.log(req.body.name);  // "Sugar"
  console.log(req.body.price); // 45 (number, because JSON.parse preserves types)
});
```

Requires `express.json()` middleware to work.

### When to Use Which?

| Data Source | Use Case | Example |
|------------|----------|---------|
| `req.params` | Identifying a specific resource | `/items/42` — get item 42 |
| `req.query` | Filtering, searching, pagination | `/items?unit=kg&page=2` |
| `req.body` | Creating or updating data | `POST /items` with JSON body |

---

## 5. Response Object — Helpers

### `res.json(data)`
```js
res.json({ name: "Sugar", price: 45 });
```
**What it does:**
1. Sets `Content-Type: application/json`
2. Calls `JSON.stringify()` on your object
3. Sends the response
4. Automatically calls `res.end()`

This replaces our 3-line `sendJSON()` helper from Chapter 01.

### `res.status(code)`
```js
res.status(201).json({ data: newItem }); // Chain with .json()
res.status(404).json({ error: "Not found" });
```
Sets the HTTP status code. Can be chained with `.json()` or `.send()`.

### `res.sendStatus(code)`
```js
res.sendStatus(204); // Sends status 204 with no body
```
Sends just the status code with no response body. Useful for DELETE operations.

### `res.send(data)`
```js
res.send("Hello World");        // text/plain
res.send({ name: "Sugar" });    // application/json (auto-detected!)
res.send(Buffer.from("data"));  // application/octet-stream
```
Smart method that detects the content type from the data. But for APIs, always prefer `res.json()` — it's more explicit.

---

## 6. Route Methods

Express maps HTTP methods to JavaScript methods:

```js
app.get("/items", handler);     // Read (list/get)
app.post("/items", handler);    // Create
app.put("/items/:id", handler); // Replace (full update)
app.patch("/items/:id", handler); // Modify (partial update)
app.delete("/items/:id", handler); // Delete
```

### REST API Convention (CRUD)

| Operation | HTTP Method | Route | Description |
|-----------|------------|-------|-------------|
| **C**reate | POST | `/api/items` | Create new item |
| **R**ead (all) | GET | `/api/items` | List all items |
| **R**ead (one) | GET | `/api/items/:id` | Get specific item |
| **U**pdate | PUT | `/api/items/:id` | Update an item |
| **D**elete | DELETE | `/api/items/:id` | Delete an item |

This pattern is called **RESTful routing**. Every resource (items, categories, customers) follows the same URL structure.

---

## 7. Environment Variables with `dotenv`

### The Problem
You don't want to hardcode sensitive values (database URLs, API keys, ports) in your code. They differ between environments:

| Variable | Development | Production |
|----------|------------|------------|
| PORT | 3000 | 80 |
| DATABASE_URL | localhost | aws-rds.com |
| JWT_SECRET | "dev-secret" | "x9k#mP2..." |

### The Solution: `.env` Files
```
# .env file (NOT committed to git!)
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://localhost:5432/mydb
```

```js
require("dotenv").config(); // Load .env into process.env
const PORT = process.env.PORT || 3000; // Fallback if not set
```

### `process.env`
`process.env` is a Node.js global object containing all environment variables. `dotenv` reads your `.env` file and injects its contents into `process.env`.

**Critical Rule:** Never commit `.env` files to git. Add `.env` to `.gitignore` and provide a `.env.example` with placeholder values.

---

## 8. `app.use()` — The Universal Middleware Attacher

```js
app.use(express.json()); // Applies to ALL routes
app.use("/api", router); // Applies only to /api/* routes
```

`app.use()` can:
1. **Register middleware** that runs on every request
2. **Mount a router** at a specific path prefix
3. **Register error handlers** (with 4 parameters)

The order of `app.use()` calls matters — middleware runs in the order it's registered.

---

## 9. 404 Catch-All Route

```js
// This MUST be the last route
app.use((req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.url}` });
});
```

**Why last?** Express checks routes in order. If no route matches, this catch-all runs. If you put it first, it would catch every request!

---

## 10. Code Walkthrough: `server.js`

### In-Memory Data Store
```js
let items = [
  { id: 1, name: "Sugar", price: 45, unit: "kg" },
  // ...
];
let nextId = 6;
```
**Why in-memory?** We don't have a database yet (that's Chapter 04). The array simulates a database. `nextId` auto-increments like a database's auto-increment primary key. The limitation: data is lost when the server restarts.

### Input Validation (Basic)
```js
if (!name || price === undefined) {
  return res.status(400).json({ error: "Fields 'name' and 'price' are required" });
}
```
**Why `price === undefined` instead of `!price`?** Because `!0` is `true` in JavaScript — a price of 0 would incorrectly fail validation. Using `=== undefined` only rejects truly missing values.

### `return` Before `res.json()`
```js
if (!item) {
  return res.status(404).json({ error: "Not found" });
  // Without return, code below would also execute!
}
res.json({ data: item }); // This would cause "headers already sent" error
```
Always `return` after sending an error response. Otherwise, the code continues and tries to send a second response, causing a crash.

---

## 11. Summary

| Concept | What You Learned |
|---------|-----------------|
| Express | Minimal web framework wrapping Node's http |
| `express()` | Creates the app object |
| `express.json()` | Parses JSON request bodies into `req.body` |
| `req.params` | URL parameters (`:id`) |
| `req.query` | Query string parameters (`?key=value`) |
| `req.body` | Parsed request body |
| `res.json()` | Send JSON response with correct headers |
| `res.status()` | Set HTTP status code |
| Route methods | `app.get()`, `app.post()`, `app.put()`, `app.delete()` |
| REST convention | CRUD operations mapped to HTTP methods |
| dotenv | Load environment variables from `.env` files |

**Next Chapter →** We organize our growing code into a proper folder structure with `express.Router()` and the MVC pattern.
