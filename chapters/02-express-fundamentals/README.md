# Chapter 02 — Express Fundamentals 🟢

## What You'll Learn
- Why Express.js exists and what it solves over raw `http`
- Setting up an Express app
- Route methods: `GET`, `POST`, `PUT`, `DELETE`
- Request data: `req.params`, `req.query`, `req.body`
- Response helpers: `res.json()`, `res.status()`, `res.send()`
- Environment variables with `dotenv`

## Why Express?

In Chapter 01 we built everything manually — parsing URLs, reading body chunks, setting headers. Express wraps all of this into a clean, expressive API:

| Raw Node.js | Express |
|------------|---------|
| `res.writeHead(200, { 'Content-Type': 'application/json' })` | `res.json(data)` |
| `if (req.url === '/users' && req.method === 'GET')` | `app.get('/users', handler)` |
| Manual body parsing with `req.on('data')` | `app.use(express.json())` |
| No built-in middleware system | `app.use(middleware)` chain |

## Key Concepts

### 1. `express()` — Application Factory
```js
const express = require('express');
const app = express();
```
Creates an Express application object — the central piece you attach everything to.

### 2. Built-in Middleware
```js
app.use(express.json());        // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse form data
```

### 3. Route Methods
```js
app.get('/path', handler);      // Read
app.post('/path', handler);     // Create
app.put('/path', handler);      // Update (full)
app.patch('/path', handler);    // Update (partial)
app.delete('/path', handler);   // Delete
```

### 4. Request Object Enriched
```js
req.params  // URL parameters → /users/:id → req.params.id
req.query   // Query string → /search?q=sugar → req.query.q
req.body    // Parsed request body (needs express.json() middleware)
```

### 5. Response Helpers
```js
res.json({ message: 'Hello' });     // Sets Content-Type + sends JSON
res.status(201).json({ id: '123' }); // Set status code + JSON
res.sendStatus(204);                 // Send status only (no body)
```

### 6. Environment Variables
```js
require('dotenv').config();
const PORT = process.env.PORT || 3000;
```

## How to Run

```bash
cd chapters/02-express-fundamentals
npm install
npm run dev
```

## Test the Routes

```bash
# Home
curl http://localhost:3000/

# Health
curl http://localhost:3000/health

# Get all items (in-memory)
curl http://localhost:3000/api/items

# Create an item
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"name": "Sugar", "price": 45}'

# Get single item
curl http://localhost:3000/api/items/1

# Search
curl "http://localhost:3000/api/items?name=sugar"
```

---

## 🏠 Homework

1. **`PUT /api/items/:id`** — Update an item by ID. Find it in the array, update its fields, return the updated item. Return 404 if not found.

2. **`DELETE /api/items/:id`** — Delete an item by ID. Remove it from the array. Return `204 No Content` on success, 404 if not found.

3. **`GET /api/items/search?q=term`** — Search items by name (case-insensitive). Return all matching items.

4. **In-memory Notes CRUD** — Create a full CRUD for a "notes" resource at `/api/notes`:
   - `POST /api/notes` — create (fields: title, content)
   - `GET /api/notes` — list all
   - `GET /api/notes/:id` — get by id
   - `PUT /api/notes/:id` — update
   - `DELETE /api/notes/:id` — delete

---

## 💡 Tips
- `express.json()` must be called with `app.use()` BEFORE your routes — otherwise `req.body` will be `undefined`
- Use `res.status(201).json(...)` for creation responses — not just `res.json()`
- `req.params.id` is always a **string** — remember to handle type coercion
