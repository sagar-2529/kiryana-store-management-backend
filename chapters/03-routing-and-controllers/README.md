# Chapter 03 — Routing & Controllers 🟢

## What You'll Learn
- MVC architecture pattern (Model-View-Controller)
- `express.Router()` for modular route grouping
- Controller functions — separating logic from routing
- Folder structure for scalable Express apps
- Route prefixes and API versioning

## Why Structure Matters

In Chapter 02, everything lived in one file. That works for tiny apps, but a real store management system will have dozens of routes. Imagine 50+ route handlers all in `server.js` — nightmare!

The solution: **separate concerns**.

```
src/
├── app.js              ← Express app config (middleware, routes)
├── server.js           ← Entry point (just starts listening)
├── routes/             ← Route definitions (URL → controller mapping)
│   ├── admin.routes.js
│   └── category.routes.js
├── controllers/        ← Business logic (what happens when a route is hit)
│   ├── admin.controller.js
│   └── category.controller.js
└── utils/              ← Shared helpers
    └── response.js
```

## Key Concepts

### 1. `express.Router()`
A mini-app that handles a group of related routes:
```js
const router = express.Router();
router.get('/', listAll);      // GET /api/v1/categories
router.post('/', create);      // POST /api/v1/categories
router.get('/:id', getById);   // GET /api/v1/categories/:id
module.exports = router;
```

### 2. Route Prefixes
Mount a router at a prefix in `app.js`:
```js
app.use('/api/v1/categories', categoryRoutes);
// Now all routes inside categoryRoutes are prefixed with /api/v1/categories
```

### 3. Controllers
Functions that contain the actual logic:
```js
// controllers/category.controller.js
const getAll = (req, res) => {
  res.json({ data: categories });
};
module.exports = { getAll };
```

### 4. API Versioning
Prefix all routes with `/api/v1/` — if you ever need to make breaking changes, you create `/api/v2/` without breaking existing clients.

## How to Run

```bash
cd chapters/03-routing-and-controllers
npm install
npm run dev
```

## Test the Routes

```bash
# Admin routes
curl http://localhost:3000/api/v1/admin/profile

# Category routes
curl http://localhost:3000/api/v1/categories
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Dairy", "description": "Milk, butter, cheese"}'
```

---

## 🏠 Homework

1. **Product Routes** — Create `routes/product.routes.js` and `controllers/product.controller.js`:
   - `POST   /api/v1/products` — create
   - `GET    /api/v1/products` — list all
   - `GET    /api/v1/products/:id` — get by id
   - `PUT    /api/v1/products/:id` — update
   - `DELETE /api/v1/products/:id` — delete
   All using in-memory arrays (no database yet).

2. **Item Routes** — Create `routes/item.routes.js` and `controllers/item.controller.js`:
   - Same 5 CRUD routes at `/api/v1/items`
   - Include `unitType` field (kg, litre, piece, etc.)

3. **Request Logging** — Add a `console.log` at the top of each controller that prints the route being called:
   ```
   [CategoryController] GET /api/v1/categories
   ```

---

## 💡 Tips
- Routes define WHAT URLs exist; Controllers define WHAT HAPPENS at those URLs
- Keep controllers thin — they should call service functions (we'll add that layer later)
- Always export an object of named functions from controllers: `module.exports = { getAll, getById, create, ... }`
