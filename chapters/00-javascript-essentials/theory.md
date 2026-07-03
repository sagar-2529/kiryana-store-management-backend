# Chapter 00 — Theory: Advanced JavaScript for Backend

---

## 1. Arrow Functions vs Regular Functions

You'll see both throughout the course. They're NOT interchangeable.

### Syntax Comparison

```js
// Regular function
function add(a, b) {
  return a + b;
}

// Arrow function (explicit return)
const add = (a, b) => {
  return a + b;
};

// Arrow function (implicit return — single expression)
const add = (a, b) => a + b;

// Arrow function (single param — no parentheses needed)
const double = x => x * 2;
```

### When to Use Which?

| Use Arrow Functions | Use Regular Functions |
|--------------------|-----------------------|
| Callbacks: `.map()`, `.filter()` | Object methods that use `this` |
| Express route handlers | Constructor functions |
| Short utility functions | When you need `arguments` object |
| Middleware | Prototype methods |

### The Critical `this` Difference

```js
// Regular function — `this` depends on HOW it's called
const obj = {
  name: "Store",
  greet: function() {
    console.log(this.name); // "Store" — `this` = obj
  },
};

// Arrow function — `this` is inherited from WHERE it's defined
const obj = {
  name: "Store",
  greet: () => {
    console.log(this.name); // undefined — `this` = outer scope (module/global)
  },
};
```

**Why this matters in backend code:**

In Chapter 07, we monkey-patch `res.writeHead`:
```js
// ✅ Must use regular function to preserve `this` (= the res object)
res.writeHead = function (...args) {
  res.setHeader("X-Response-Time", `${Date.now() - start}ms`);
  originalWriteHead.apply(this, args); // `this` = res
};

// ❌ Arrow function would break — `this` wouldn't be `res`
res.writeHead = (...args) => {
  originalWriteHead.apply(this, args); // `this` = outer scope, NOT res!
};
```

**Rule of thumb:** Use arrow functions for everything EXCEPT when you need dynamic `this` binding.

---

## 2. Destructuring

Destructuring extracts values from objects and arrays into individual variables. You'll use this in **every single controller**.

### Object Destructuring

```js
// Without destructuring
const name = req.body.name;
const price = req.body.price;
const unitType = req.body.unitType;

// With destructuring — same thing, one line
const { name, price, unitType } = req.body;
```

### Nested Destructuring

```js
const response = {
  data: {
    user: { id: 1, name: "Admin" },
  },
};

const { data: { user: { name } } } = response;
console.log(name); // "Admin"
```

### Default Values

```js
const { page = 1, pageSize = 10 } = req.query;
// If req.query.page is undefined, page defaults to 1
```

### Renaming

```js
const { name: categoryName } = req.body;
// Extracts req.body.name into variable called categoryName
```

### Array Destructuring

```js
const [first, second] = "Bearer eyJ...".split(" ");
// first = "Bearer", second = "eyJ..."

// Skip elements
const [, token] = "Bearer eyJ...".split(" ");
// token = "eyJ..."
```

### In Function Parameters

```js
// Without — access properties inside function
function createCategory(options) {
  const name = options.name;
  const description = options.description;
}

// With — destructure in the parameter
function createCategory({ name, description }) {
  // name and description are directly available
}
```

**This is how every controller in the course works:**
```js
const create = async (req, res) => {
  const { name, description, adminId } = req.body;
  // Use name, description, adminId directly
};
```

---

## 3. Spread & Rest Operators (`...`)

The three dots (`...`) do two different things depending on context.

### Spread — Expanding

```js
// Spread into object (shallow copy + merge)
const defaults = { page: 1, pageSize: 10 };
const options = { ...defaults, page: 3 };
// { page: 3, pageSize: 10 } — page 3 overwrites default

// Spread into array
const arr1 = [1, 2];
const arr2 = [...arr1, 3, 4]; // [1, 2, 3, 4]
```

**Used in Chapter 05 for partial updates:**
```js
const data = {
  ...(name !== undefined && { name }),
  ...(description !== undefined && { description }),
};
// Only includes fields that were provided
```

**How `...(condition && { key: value })` works:**
```js
// If name = "Dairy":
...(true && { name: "Dairy" })  →  ...{ name: "Dairy" }  →  name: "Dairy" ✓

// If name = undefined:
...(false && { name: undefined })  →  ...false  →  nothing (spread of false is empty)
```

### Rest — Collecting

```js
// Collect remaining properties
const { id, ...updateData } = req.body;
// id = "abc", updateData = everything else

// Collect remaining arguments
function log(level, ...messages) {
  console.log(`[${level}]`, ...messages);
}
log("INFO", "Server", "started", "on port", 3000);
```

---

## 4. Higher-Order Functions

A higher-order function is a function that **takes a function as an argument** OR **returns a function**. This is the single most important pattern in Express.

### Functions as Arguments

```js
// .map() takes a function
const prices = [10, 20, 30];
const doubled = prices.map(p => p * 2); // [20, 40, 60]

// .filter() takes a function
const expensive = prices.filter(p => p > 15); // [20, 30]

// Express route takes a function
app.get("/items", (req, res) => { ... });
//                 ↑ this is a function passed as an argument
```

### Functions Returning Functions (Factories)

This is the core of middleware:

```js
// validate() returns a NEW function
const validate = (schema) => {
  // This inner function is what Express calls as middleware
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);
    next();
  };
};

// Usage — validate(schema) is CALLED, returns middleware function
router.post("/", validate(createCategorySchema), controller.create);
```

**Step by step:**
1. `validate(createCategorySchema)` runs immediately when the route is registered
2. It returns a new function `(req, res, next) => { ... }`
3. Express stores this returned function
4. When a POST request arrives, Express calls the stored function with `(req, res, next)`

### `asyncHandler` — The Key Pattern

```js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

**Breakdown:**
1. `asyncHandler` takes `fn` (your async controller)
2. Returns a NEW function `(req, res, next) => ...`
3. The new function calls `fn(req, res, next)` and wraps it in `Promise.resolve()`
4. If the promise rejects (error), `.catch(next)` passes the error to Express

**Without this understanding, most of Chapter 07 is magic.**

---

## 5. Closures

A closure is when a function "remembers" variables from its outer scope even after the outer function has finished executing.

```js
function createCounter() {
  let count = 0; // This variable is "closed over"

  return {
    increment: () => ++count,
    getCount: () => count,
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2
counter.getCount();  // 2
// `count` is not accessible from outside, but the functions still access it
```

### Closures in the Course

**Middleware factories are closures:**
```js
const validate = (schema) => {
  // `schema` is closed over — the returned function remembers it
  return (req, res, next) => {
    schema.safeParse(req.body); // Still has access to `schema`!
  };
};
```

**Cache middleware is a closure:**
```js
function cacheMiddleware(key, ttl) {
  // `key` and `ttl` are closed over
  return (req, res, next) => {
    const cached = cache.get(key); // Still has access to `key`
    // ...
  };
}
```

**Rate limiters use closures to track request counts per IP.**

---

## 6. Callbacks & the Event Loop

### Callbacks

A callback is a function passed to another function to be executed later:

```js
// setTimeout — calls the callback after 1000ms
setTimeout(() => {
  console.log("This runs after 1 second");
}, 1000);

// fs.readFile — calls the callback when file is read
const fs = require("fs");
fs.readFile("data.json", "utf8", (err, data) => {
  if (err) throw err;
  console.log(data);
});

// Event listener — calls callback when event fires
res.on("finish", () => {
  console.log("Response sent!");
});
```

### The Event Loop (Simplified)

```
console.log("A");
setTimeout(() => console.log("B"), 0);
console.log("C");

// Output: A, C, B
// Why? setTimeout is async — even with 0ms delay, it's queued for later
```

```
1. "A" runs immediately (synchronous)
2. setTimeout schedules "B" (async — goes to task queue)
3. "C" runs immediately (synchronous)
4. Event loop checks task queue — finds "B" — runs it
```

**Why this matters:** In Chapter 01's raw HTTP server, we use `req.on("data", callback)` because the request body arrives asynchronously in chunks. We can't just call `req.getBody()` synchronously.

### Callback Hell (The Problem Promises Solve)

```js
getUser(userId, (err, user) => {
  if (err) return handleError(err);
  getOrders(user.id, (err, orders) => {
    if (err) return handleError(err);
    getItems(orders[0].id, (err, items) => {
      if (err) return handleError(err);
      // 3 levels deep — "pyramid of doom"
    });
  });
});
```

---

## 7. Promises

A Promise represents a value that may not be available yet. It's in one of three states:

```
┌──────────┐
│ PENDING  │ → Operation in progress
└────┬─────┘
     │
     ├──→ ┌───────────┐
     │    │ FULFILLED  │ → Operation succeeded (.then runs)
     │    └───────────┘
     │
     └──→ ┌───────────┐
          │ REJECTED   │ → Operation failed (.catch runs)
          └───────────┘
```

### Creating Promises

```js
const myPromise = new Promise((resolve, reject) => {
  const success = true;
  if (success) {
    resolve("It worked!"); // Moves to FULFILLED
  } else {
    reject(new Error("It failed")); // Moves to REJECTED
  }
});
```

### Consuming Promises

```js
myPromise
  .then(result => console.log(result))  // "It worked!"
  .catch(error => console.error(error))
  .finally(() => console.log("Done"));  // Always runs
```

### Promise Chaining

```js
fetchUser(id)
  .then(user => fetchOrders(user.id))
  .then(orders => fetchItems(orders[0].id))
  .then(items => console.log(items))
  .catch(err => console.error(err)); // Catches ANY error in the chain
```

### `Promise.all()` — Parallel Execution

```js
// Run multiple promises simultaneously
const [categories, total] = await Promise.all([
  prisma.category.findMany(),
  prisma.category.count(),
]);
```

**Used in Chapter 13** for pagination — fetch data and count in parallel instead of sequentially (2x faster).

### `Promise.resolve()` — Wrapping Values

```js
Promise.resolve(42);          // Creates a fulfilled promise with value 42
Promise.resolve(somePromise); // Returns the same promise (no double-wrapping)
```

**Used in `asyncHandler`:**
```js
Promise.resolve(fn(req, res, next)).catch(next);
// If fn is async → already returns a promise → .catch works
// If fn is sync → wraps return value in a promise → .catch still works
```

---

## 8. Async/Await

`async/await` is syntactic sugar over Promises. It makes asynchronous code look synchronous.

### The Basics

```js
// Promise chain style
function getCategory(id) {
  return prisma.category.findUnique({ where: { id } })
    .then(category => {
      if (!category) throw new Error("Not found");
      return category;
    });
}

// Async/await style — same thing, but readable
async function getCategory(id) {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new Error("Not found");
  return category;
}
```

### Rules

1. `await` can only be used inside an `async` function
2. `async` functions always return a Promise
3. `await` pauses execution until the Promise resolves
4. If the Promise rejects, `await` throws an error

### Error Handling

```js
// With try/catch
async function getCategory(id) {
  try {
    const category = await prisma.category.findUnique({ where: { id } });
    return category;
  } catch (error) {
    console.error("DB error:", error);
    throw error;
  }
}

// Without try/catch — let asyncHandler catch it
const getCategory = asyncHandler(async (req, res) => {
  const category = await prisma.category.findUnique({ where: { id: req.params.id } });
  if (!category) throw new NotFoundError("Category");
  res.json({ data: category });
  // Errors automatically caught by asyncHandler → error middleware
});
```

### Sequential vs Parallel

```js
// ❌ Sequential — second query waits for first (slow)
const categories = await prisma.category.findMany();
const products = await prisma.product.findMany();
// Total time: time(categories) + time(products)

// ✅ Parallel — both queries run simultaneously (fast)
const [categories, products] = await Promise.all([
  prisma.category.findMany(),
  prisma.product.findMany(),
]);
// Total time: max(time(categories), time(products))
```

### Common Mistake: `await` in Loops

```js
// ❌ Sequential — each iteration waits
for (const item of items) {
  await prisma.item.update({ where: { id: item.id }, data: { ... } });
}

// ✅ Parallel — all updates run at once
await Promise.all(
  items.map(item => prisma.item.update({ where: { id: item.id }, data: { ... } }))
);
```

**Exception:** In transactions (Chapter 11), sequential is correct because operations depend on each other:
```js
await prisma.$transaction(async (tx) => {
  // These MUST be sequential — each depends on the previous
  const purchase = await tx.purchase.create({ ... });
  await tx.purchaseItem.create({ data: { purchaseId: purchase.id, ... } });
});
```

---

## 9. Error Handling Patterns

### `try/catch`

```js
try {
  const data = JSON.parse(invalidJson);
} catch (error) {
  console.error("Parse failed:", error.message);
} finally {
  console.log("Always runs");
}
```

### Custom Error Classes

```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);        // Call parent constructor
    this.statusCode = statusCode;
    this.isOperational = true;
    this.name = this.constructor.name; // "AppError", "NotFoundError", etc.
    Error.captureStackTrace(this, this.constructor);
  }
}

class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404);
  }
}
```

**`Error.captureStackTrace(this, this.constructor)`** — removes the constructor call itself from the stack trace, making it cleaner.

### Throwing vs Returning Errors

```js
// Throwing — exits the function immediately, caught by try/catch or asyncHandler
throw new NotFoundError("Category");

// Returning — does NOT exit, code continues (bug-prone)
return new NotFoundError("Category"); // ❌ No one catches this!
```

In the course, we always **throw**. The `asyncHandler` catches it, and the global error handler sends the response.

---

## 10. Classes & Inheritance

### Class Syntax

```js
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a sound`;
  }
}

const dog = new Animal("Rex");
dog.speak(); // "Rex makes a sound"
```

### Inheritance with `extends`

```js
class Dog extends Animal {
  constructor(name, breed) {
    super(name);  // MUST call super() before using `this`
    this.breed = breed;
  }

  speak() {
    return `${this.name} barks`; // Overrides parent method
  }
}
```

### Used in Chapter 09: Error Hierarchy

```js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Calls Error's constructor
    this.statusCode = statusCode;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404); // Calls AppError's constructor
  }
}

// Usage:
throw new NotFoundError("Category");
// Creates: { message: "Category not found", statusCode: 404 }
```

### Static Methods

```js
class MathHelper {
  static add(a, b) { return a + b; }
}

MathHelper.add(2, 3); // 5 — called on the class, not an instance
// No `new MathHelper()` needed
```

---

## 11. Modules (`require` / `module.exports`)

### CommonJS (What Node.js Uses)

```js
// ── Exporting ──────────────────────────────
// Single export
module.exports = function add(a, b) { return a + b; };

// Named exports (object)
module.exports = { add, subtract, multiply };

// Shorthand named export
exports.add = (a, b) => a + b;
// ⚠️ Never do: exports = { ... } — this breaks the reference!

// ── Importing ──────────────────────────────
const add = require("./math");                  // Single export
const { add, subtract } = require("./math");    // Named exports (destructured)
const math = require("./math");                 // Full object: math.add()
```

### How `require()` Works

1. **Resolves the path** — `"./math"` → `./math.js` → absolute path
2. **Checks the cache** — if already loaded, returns cached version
3. **Loads the file** — reads and executes the JavaScript
4. **Caches the result** — stores `module.exports` for future `require()`
5. **Returns `module.exports`**

**Cache is key:** Calling `require("./prisma")` 100 times returns the SAME object. This is why the Prisma singleton works — the module is only executed once.

### Import Patterns in the Course

```js
// External package
const express = require("express");

// Local file (relative path)
const prisma = require("../lib/prisma");

// Local file (destructured)
const { sendSuccess, sendError } = require("../utils/response");

// Folder with index.js
const routes = require("./routes");
// Loads ./routes/index.js automatically
```

---

## 12. `globalThis` & Singletons

### `globalThis`

`globalThis` is the global object in any JavaScript environment:
- Browser: `globalThis === window`
- Node.js: `globalThis === global`

```js
globalThis.myValue = 42;
console.log(globalThis.myValue); // 42 (accessible everywhere)
```

### Singleton Pattern (Chapter 04)

```js
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

**Why:** In development, nodemon clears the module cache on restart. Without `globalThis`, each restart creates a new PrismaClient (new DB connection pool). `globalThis` survives module reloads, ensuring one client instance.

---

## 13. Optional Chaining & Nullish Coalescing

### Optional Chaining (`?.`)

Safely access nested properties that might be `null` or `undefined`:

```js
// Without — crashes if customer is null
const name = purchase.customer.name; // TypeError: Cannot read property 'name' of null

// With — returns undefined instead of crashing
const name = purchase.customer?.name; // undefined (no crash)

// Chain multiple levels
const city = user?.address?.city; // Safe even if address is null

// On method calls
const upper = name?.toUpperCase(); // Only calls if name exists

// On arrays
const first = items?.[0]; // Safe even if items is null
```

**Used extensively in controllers:**
```js
const authHeader = req.headers.authorization;
const token = authHeader?.split(" ")?.[1]; // Safe extraction
```

### Nullish Coalescing (`??`)

Returns the right-hand value ONLY if the left is `null` or `undefined` (not `0`, `""`, `false`):

```js
const port = process.env.PORT ?? 3000;

// ?? vs ||
const value1 = 0 || 10;   // 10 (0 is falsy!)
const value2 = 0 ?? 10;   // 0  (0 is not null/undefined)

const value3 = "" || "default";   // "default" ("" is falsy!)
const value4 = "" ?? "default";   // "" ("" is not null/undefined)
```

**When to use which:**
- `??` — when `0`, `""`, `false` are valid values (prices, flags)
- `||` — when you want a fallback for any falsy value

---

## 14. `this`, `bind`, `apply`, `call`

### `this` in Node.js

In the top level of a Node module, `this === module.exports` (an empty object `{}`), NOT `global`.

### `call` and `apply` — Invoke with a Specific `this`

```js
function greet(greeting) {
  return `${greeting}, ${this.name}!`;
}

const user = { name: "Admin" };

greet.call(user, "Hello");    // "Hello, Admin!" — args as list
greet.apply(user, ["Hello"]); // "Hello, Admin!" — args as array
```

**Used in Chapter 07 when monkey-patching `res.writeHead`:**
```js
const originalWriteHead = res.writeHead;

res.writeHead = function (...args) {
  res.setHeader("X-Response-Time", "5ms");
  originalWriteHead.apply(this, args);
  // apply(this, args) calls the original function with:
  // - `this` = the res object
  // - args = the original arguments
};
```

### `bind` — Create a New Function with Fixed `this`

```js
const user = { name: "Admin" };
const boundGreet = greet.bind(user);
boundGreet("Hello"); // "Hello, Admin!"

// Common pattern: binding class methods
const originalJson = res.json.bind(res);
// Now originalJson can be called without `res.` prefix and still works
```

---

## 15. Template Literals & Tagged Templates

### Template Literals

```js
const name = "Sugar";
const price = 45;
const msg = `${name} costs ₹${price}`; // "Sugar costs ₹45"

// Multi-line strings (no \n needed)
const query = `
  SELECT *
  FROM items
  WHERE price > ${price}
`;
```

### Tagged Templates (Advanced)

```js
// Prisma uses this for safe SQL:
const result = await prisma.$queryRaw`
  SELECT * FROM items WHERE name = ${userInput}
`;
// This is NOT string interpolation!
// Prisma receives the template parts separately and parameterizes the values
// Prevents SQL injection!
```

**How tagged templates work:**
```js
function tag(strings, ...values) {
  // strings = ["SELECT * FROM items WHERE name = ", ""]
  // values = [userInput]
  // The function can process them safely
}
tag`SELECT * FROM items WHERE name = ${userInput}`;
```

The tag function receives the static string parts and dynamic values separately, enabling safe SQL parameterization.

---

## Summary: Where Each Concept Appears

| Concept | Key Chapters |
|---------|-------------|
| Arrow functions | Ch01–16 (everywhere) |
| Destructuring | Ch02+ (every controller) |
| Spread operator | Ch05 (partial updates), Ch07 (rest args) |
| Higher-order functions | Ch07 (asyncHandler), Ch08 (validate factory) |
| Closures | Ch07–08 (middleware factories), Ch15 (cache) |
| Callbacks | Ch01 (HTTP events), Ch14 (multer callbacks) |
| Promises | Ch04+ (all Prisma queries) |
| Async/await | Ch04+ (every controller and service) |
| Classes | Ch09 (AppError hierarchy) |
| Modules | Every file (require/exports) |
| `globalThis` | Ch04 (Prisma singleton) |
| Optional chaining | Ch10 (auth header parsing) |
| `apply` / `bind` | Ch07 (monkey-patching res methods) |
| Tagged templates | Ch12 (`$queryRaw`) |
