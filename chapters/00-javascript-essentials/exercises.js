// ============================================================
// Chapter 00 — Exercises
// Complete each function. Run: node exercises.js
// Tests at the bottom will verify your solutions.
// ============================================================

// ── Exercise 1: Destructuring ──────────────────────────────
// Extract `name`, `price`, and `stock` from the item object.
// If `stock` is not provided, default to 0.
// Return an object { name, price, stock }.

function extractItemData(item) {
  // YOUR CODE HERE
}

// ── Exercise 2: Spread (Partial Update) ────────────────────
// Given `existingItem` and `updates`, merge them.
// Only include fields from `updates` that are NOT undefined.
// Return the merged object.
//
// Example:
//   mergeUpdates({ name: "Sugar", price: 45 }, { price: 50, stock: undefined })
//   → { name: "Sugar", price: 50 }

function mergeUpdates(existingItem, updates) {
  // YOUR CODE HERE
}

// ── Exercise 3: Higher-Order Function (Factory) ────────────
// Create a function `createFilter` that takes a `field` name and `value`.
// It should return a NEW function that takes an array of objects
// and returns only the objects where obj[field] === value.
//
// Example:
//   const filterByUnit = createFilter("unitType", "KG");
//   filterByUnit([{ name: "Sugar", unitType: "KG" }, { name: "Milk", unitType: "LITRE" }])
//   → [{ name: "Sugar", unitType: "KG" }]

function createFilter(field, value) {
  // YOUR CODE HERE
}

// ── Exercise 4: asyncHandler ───────────────────────────────
// Implement `asyncHandler` — a function that:
// 1. Takes an async function `fn`
// 2. Returns a new function that takes (req, res, next)
// 3. Calls fn(req, res, next)
// 4. If fn throws/rejects, calls next(error)

function asyncHandler(fn) {
  // YOUR CODE HERE
}

// ── Exercise 5: Custom Error Class ─────────────────────────
// Create a `ValidationError` class that:
// 1. Extends Error
// 2. Has a `statusCode` property set to 400
// 3. Has a `details` property (optional, from constructor)
// 4. Has `isOperational` set to true

class ValidationError extends Error {
  // YOUR CODE HERE
}

// ── Exercise 6: Promise.all with Error Handling ────────────
// Given an array of item IDs, fetch all items in parallel.
// If ANY item fails, return { success: false, error: "..." }.
// If all succeed, return { success: true, data: [...items] }.
// Use the `fetchItem` helper below.

function fetchItem(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id > 0 && id <= 3) resolve({ id, name: `Item-${id}` });
      else reject(new Error(`Item ${id} not found`));
    }, 50);
  });
}

async function fetchAllItems(ids) {
  // YOUR CODE HERE (use Promise.all and try/catch)
}

// ── Exercise 7: Closure (Request Counter) ──────────────────
// Create a function `createRequestCounter` that returns an object with:
// - `increment()` — adds 1 to count, returns new count
// - `getCount()` — returns current count
// - `reset()` — sets count back to 0
// The count should be private (not directly accessible).

function createRequestCounter() {
  // YOUR CODE HERE
}

// ── Exercise 8: Optional Chaining ──────────────────────────
// Given a `purchase` object that may have nested nulls, safely extract:
// - customerName (from purchase.customer.name, default "Cash Customer")
// - firstItemName (from purchase.items[0].name, default "Unknown")
// Return { customerName, firstItemName }

function extractPurchaseInfo(purchase) {
  // YOUR CODE HERE (use ?. and ??)
}

// ============================================================
// TESTS — Run `node exercises.js` to check your solutions
// ============================================================

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}: ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "Assertion failed");
}

function assertEqual(actual, expected, message) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${message || ""} Expected ${e}, got ${a}`);
}

console.log("\n📝 Running Exercise Tests...\n");

// Test Exercise 1
console.log("Exercise 1: Destructuring");
test("extracts all fields", () => {
  assertEqual(extractItemData({ name: "Sugar", price: 45, stock: 10 }), { name: "Sugar", price: 45, stock: 10 });
});
test("defaults stock to 0", () => {
  assertEqual(extractItemData({ name: "Milk", price: 28 }), { name: "Milk", price: 28, stock: 0 });
});

// Test Exercise 2
console.log("\nExercise 2: Spread (Partial Update)");
test("merges defined fields only", () => {
  const result = mergeUpdates({ name: "Sugar", price: 45 }, { price: 50, stock: undefined });
  assertEqual(result, { name: "Sugar", price: 50 });
});
test("keeps all original fields", () => {
  const result = mergeUpdates({ a: 1, b: 2, c: 3 }, { b: 99 });
  assertEqual(result, { a: 1, b: 99, c: 3 });
});

// Test Exercise 3
console.log("\nExercise 3: Higher-Order Function");
test("filters by field value", () => {
  const filter = createFilter("unitType", "KG");
  const data = [{ name: "Sugar", unitType: "KG" }, { name: "Milk", unitType: "LITRE" }];
  assertEqual(filter(data), [{ name: "Sugar", unitType: "KG" }]);
});
test("returns empty for no matches", () => {
  const filter = createFilter("name", "Ghee");
  assertEqual(filter([{ name: "Sugar" }, { name: "Rice" }]), []);
});

// Test Exercise 4
console.log("\nExercise 4: asyncHandler");
test("passes errors to next", async () => {
  let caughtError = null;
  const next = (err) => { caughtError = err; };
  const handler = asyncHandler(async () => { throw new Error("Test error"); });
  await handler({}, {}, next);
  assert(caughtError !== null, "Error should be caught");
  assertEqual(caughtError.message, "Test error");
});

// Test Exercise 5
console.log("\nExercise 5: Custom Error Class");
test("has correct properties", () => {
  const err = new ValidationError("Bad input", { name: "required" });
  assertEqual(err.message, "Bad input");
  assertEqual(err.statusCode, 400);
  assertEqual(err.isOperational, true);
  assert(err instanceof Error, "Should be instance of Error");
});

// Test Exercise 6
console.log("\nExercise 6: Promise.all");
test("returns all items on success", async () => {
  const result = await fetchAllItems([1, 2, 3]);
  assertEqual(result.success, true);
  assertEqual(result.data.length, 3);
});
test("returns error on failure", async () => {
  const result = await fetchAllItems([1, 999]);
  assertEqual(result.success, false);
  assert(result.error !== undefined, "Should have error message");
});

// Test Exercise 7
console.log("\nExercise 7: Closure (Counter)");
test("increments and returns count", () => {
  const counter = createRequestCounter();
  assertEqual(counter.increment(), 1);
  assertEqual(counter.increment(), 2);
  assertEqual(counter.getCount(), 2);
});
test("resets to 0", () => {
  const counter = createRequestCounter();
  counter.increment();
  counter.increment();
  counter.reset();
  assertEqual(counter.getCount(), 0);
});

// Test Exercise 8
console.log("\nExercise 8: Optional Chaining");
test("extracts from full object", () => {
  const purchase = { customer: { name: "Raj" }, items: [{ name: "Sugar" }] };
  assertEqual(extractPurchaseInfo(purchase), { customerName: "Raj", firstItemName: "Sugar" });
});
test("handles nulls gracefully", () => {
  assertEqual(extractPurchaseInfo({ customer: null, items: [] }), { customerName: "Cash Customer", firstItemName: "Unknown" });
});
test("handles undefined purchase", () => {
  assertEqual(extractPurchaseInfo({}), { customerName: "Cash Customer", firstItemName: "Unknown" });
});

// Wait for async tests
setTimeout(() => {
  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log(`═══════════════════════════════════════════════`);
  if (failed > 0) console.log("  Keep going! Fix the failing tests.\n");
  else console.log("  🎉 All tests passed! You're ready for Chapter 01.\n");
}, 500);
