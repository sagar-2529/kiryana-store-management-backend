// ============================================================
// Chapter 00 — Runnable JavaScript Examples
// Run: node examples.js
// ============================================================

console.log("═══════════════════════════════════════════════════");
console.log("  Chapter 00 — JavaScript Essentials for Backend  ");
console.log("═══════════════════════════════════════════════════\n");

// ── 1. Arrow Functions vs Regular Functions ─────────────────

console.log("── 1. Arrow Functions ──");

// Syntax variations
const add = (a, b) => a + b;                   // Implicit return
const greet = (name) => `Hello, ${name}!`;      // Single param
const getTimestamp = () => new Date().toISOString(); // No params
const createItem = (name, price) => ({          // Return object (wrap in parens!)
  name,
  price,
  createdAt: new Date(),
});

console.log("add(2, 3):", add(2, 3));                    // 5
console.log("greet('Store'):", greet("Store"));           // Hello, Store!
console.log("createItem:", createItem("Sugar", 45));      // { name: 'Sugar', ... }

// `this` difference
const shop = {
  name: "Kiryana Store",
  // Regular function — `this` = shop
  regularGreet: function () {
    return `Welcome to ${this.name}`;
  },
  // Arrow function — `this` = module scope (NOT shop!)
  arrowGreet: () => {
    return `Welcome to ${this.name}`; // this.name is undefined here
  },
};
console.log("Regular this:", shop.regularGreet()); // Welcome to Kiryana Store
console.log("Arrow this:", shop.arrowGreet());     // Welcome to undefined
console.log();

// ── 2. Destructuring ───────────────────────────────────────

console.log("── 2. Destructuring ──");

// Object destructuring (simulating req.body)
const reqBody = { name: "Dairy", description: "Milk products", adminId: "uuid-1" };
const { name, description, adminId } = reqBody;
console.log("Destructured:", name, description, adminId);

// Default values (simulating req.query)
const reqQuery = { page: "3" };
const { page = "1", pageSize = "10" } = reqQuery;
console.log("With defaults:", page, pageSize); // "3", "10"

// Renaming
const { name: catName } = reqBody;
console.log("Renamed:", catName); // "Dairy"

// Array destructuring (splitting auth header)
const authHeader = "Bearer eyJhbGciOiJIUzI1NiJ9";
const [, token] = authHeader.split(" ");
console.log("Token:", token); // eyJhbGciOiJIUzI1NiJ9

// Nested destructuring
const apiResponse = { data: { user: { id: 1, email: "admin@store.com" } } };
const { data: { user: { email } } } = apiResponse;
console.log("Nested email:", email); // admin@store.com
console.log();

// ── 3. Spread & Rest ───────────────────────────────────────

console.log("── 3. Spread & Rest ──");

// Spread for shallow copy
const original = { a: 1, b: 2, c: 3 };
const copy = { ...original, b: 99 }; // Override b
console.log("Spread merge:", copy); // { a: 1, b: 99, c: 3 }

// Conditional spread (THE partial update pattern)
const inputName = "New Name";
const inputDesc = undefined; // Not provided

const updateData = {
  ...(inputName !== undefined && { name: inputName }),
  ...(inputDesc !== undefined && { description: inputDesc }),
};
console.log("Conditional spread:", updateData); // { name: "New Name" }

// Rest operator (collect remaining)
const { a, ...rest } = original;
console.log("Rest:", rest); // { b: 2, c: 3 }
console.log();

// ── 4. Higher-Order Functions ──────────────────────────────

console.log("── 4. Higher-Order Functions ──");

// Function that takes a function
const items = [
  { name: "Sugar", price: 45 },
  { name: "Rice", price: 120 },
  { name: "Milk", price: 28 },
];

const names = items.map((item) => item.name);
console.log("map:", names); // ["Sugar", "Rice", "Milk"]

const expensive = items.filter((item) => item.price > 40);
console.log("filter:", expensive); // [Sugar, Rice]

const total = items.reduce((sum, item) => sum + item.price, 0);
console.log("reduce total:", total); // 193

// Function that returns a function (FACTORY PATTERN)
function createMultiplier(factor) {
  return (number) => number * factor;
}
const double = createMultiplier(2);
const triple = createMultiplier(3);
console.log("double(5):", double(5));  // 10
console.log("triple(5):", triple(5));  // 15

// Middleware factory pattern (simplified)
function validate(schema) {
  console.log(`  [Factory] Creating validator for: ${schema}`);
  return function middleware(data) {
    console.log(`  [Middleware] Validating:`, data, `against: ${schema}`);
    return true;
  };
}
const categoryValidator = validate("CategorySchema"); // Factory runs NOW
categoryValidator({ name: "Dairy" });                  // Middleware runs LATER
console.log();

// ── 5. Closures ────────────────────────────────────────────

console.log("── 5. Closures ──");

function createCounter(initialValue = 0) {
  let count = initialValue; // "closed over" — survives after createCounter returns

  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  };
}

const counter = createCounter(10);
counter.increment();
counter.increment();
counter.decrement();
console.log("Counter:", counter.getCount()); // 11

// Cache with closure (simplified version of Chapter 15's cache)
function createCache(ttlMs = 5000) {
  const store = new Map();

  return {
    set: (key, value) => {
      store.set(key, { value, expiry: Date.now() + ttlMs });
    },
    get: (key) => {
      const entry = store.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expiry) {
        store.delete(key);
        return null;
      }
      return entry.value;
    },
  };
}

const cache = createCache(2000);
cache.set("categories", [{ name: "Dairy" }]);
console.log("Cache hit:", cache.get("categories")); // [{ name: "Dairy" }]
console.log();

// ── 6. Promises ────────────────────────────────────────────

console.log("── 6. Promises ──");

// Creating a promise
function fetchItem(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 1) resolve({ id: 1, name: "Sugar", price: 45 });
      else reject(new Error(`Item ${id} not found`));
    }, 100);
  });
}

// Consuming with .then/.catch
fetchItem(1)
  .then((item) => console.log("Promise resolved:", item.name))
  .catch((err) => console.error("Promise rejected:", err.message));

// Promise.all — parallel execution
Promise.all([fetchItem(1), fetchItem(1)]).then(([a, b]) => {
  console.log("Promise.all:", a.name, b.name);
});

// Promise.resolve — wrapping a value
const wrapped = Promise.resolve(42);
wrapped.then((val) => console.log("Promise.resolve:", val)); // 42

// ── 7. Async/Await ─────────────────────────────────────────

// (runs after promises above due to event loop)
async function asyncExamples() {
  console.log("\n── 7. Async/Await ──");

  // Basic await
  const item = await fetchItem(1);
  console.log("Awaited:", item.name);

  // Error handling with try/catch
  try {
    await fetchItem(999);
  } catch (error) {
    console.log("Caught async error:", error.message);
  }

  // Parallel with await
  const [item1, item2] = await Promise.all([fetchItem(1), fetchItem(1)]);
  console.log("Parallel await:", item1.name, item2.name);
}

// ── 8. Classes & Inheritance ───────────────────────────────

async function classExamples() {
  console.log("\n── 8. Classes ──");

  class AppError extends Error {
    constructor(message, statusCode) {
      super(message); // MUST call super() first in child classes
      this.statusCode = statusCode;
      this.isOperational = true;
      this.name = this.constructor.name;
    }
  }

  class NotFoundError extends AppError {
    constructor(resource = "Resource") {
      super(`${resource} not found`, 404);
    }
  }

  class ValidationError extends AppError {
    constructor(message = "Validation failed") {
      super(message, 400);
    }
  }

  const err1 = new NotFoundError("Category");
  console.log("NotFoundError:", err1.message, "status:", err1.statusCode);
  console.log("  instanceof AppError:", err1 instanceof AppError);     // true
  console.log("  instanceof Error:", err1 instanceof Error);           // true
  console.log("  name:", err1.name);                                   // NotFoundError

  const err2 = new ValidationError("Price must be positive");
  console.log("ValidationError:", err2.message, "status:", err2.statusCode);
}

// ── 9. Optional Chaining & Nullish Coalescing ──────────────

async function optionalExamples() {
  console.log("\n── 9. Optional Chaining & Nullish Coalescing ──");

  const purchase = { customer: null, items: [{ name: "Sugar" }] };

  // Optional chaining
  console.log("customer?.name:", purchase.customer?.name);       // undefined (no crash!)
  console.log("items?.[0]?.name:", purchase.items?.[0]?.name);   // "Sugar"

  // Nullish coalescing
  const port = undefined ?? 3000;
  console.log("port:", port); // 3000

  // ?? vs ||
  const stock = 0;
  console.log("stock || 10:", stock || 10);   // 10 (0 is falsy!)
  console.log("stock ?? 10:", stock ?? 10);   // 0  (0 is not null/undefined)
}

// ── 10. this / bind / apply / call ─────────────────────────

async function thisExamples() {
  console.log("\n── 10. this / bind / apply / call ──");

  function introduce(greeting) {
    return `${greeting}, I'm ${this.name}`;
  }

  const admin = { name: "Sagar" };

  // call — invoke with specific `this`, args as list
  console.log("call:", introduce.call(admin, "Hello"));

  // apply — invoke with specific `this`, args as array
  console.log("apply:", introduce.apply(admin, ["Hi"]));

  // bind — create new function with fixed `this`
  const boundIntro = introduce.bind(admin);
  console.log("bind:", boundIntro("Hey"));

  // Real-world pattern: monkey-patching (from Chapter 07)
  const res = {
    statusCode: 200,
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    writeHead: function (code) {
      this.statusCode = code;
      console.log("  Original writeHead called, status:", code);
    },
  };

  const originalWriteHead = res.writeHead;
  res.writeHead = function (...args) {
    this.setHeader("X-Response-Time", "5ms");
    originalWriteHead.apply(this, args); // `this` = res
  };

  res.writeHead(200);
  console.log("  Patched headers:", res.headers); // { 'X-Response-Time': '5ms' }
}

// ── 11. The asyncHandler Pattern (Putting It All Together) ─

async function asyncHandlerDemo() {
  console.log("\n── 11. asyncHandler Deep Dive ──");

  // This combines: higher-order functions + closures + promises + arrow functions
  const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

  // Simulated Express objects
  const req = { params: { id: "1" } };
  const res = {
    json: (data) => console.log("  Response:", JSON.stringify(data)),
    status: function (code) { this.statusCode = code; return this; },
  };
  const next = (err) => {
    if (err) console.log("  Error caught by next():", err.message);
  };

  // A controller wrapped in asyncHandler
  const getById = asyncHandler(async (req, res) => {
    // Simulated async operation
    const item = await fetchItem(parseInt(req.params.id));
    res.json({ success: true, data: item });
  });

  // Call it like Express would
  await getById(req, res, next);

  // With an error
  const getBad = asyncHandler(async (req, res) => {
    throw new Error("Database connection failed");
  });
  await getBad(req, res, next); // Error caught by next()!
}

// ── Run all examples ───────────────────────────────────────

(async () => {
  await asyncExamples();
  await classExamples();
  await optionalExamples();
  await thisExamples();
  await asyncHandlerDemo();

  console.log("\n═══════════════════════════════════════════════════");
  console.log("  All examples complete! Now try exercises.js     ");
  console.log("═══════════════════════════════════════════════════");
})();
