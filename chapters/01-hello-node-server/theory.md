# Chapter 01 — Theory: Node.js HTTP Server

---

## 1. What is Node.js?

Node.js is a **JavaScript runtime** built on Chrome's V8 engine. Before Node.js, JavaScript could only run inside a browser. Node.js lets you run JavaScript on the server — handling files, databases, network requests, and more.

### Why Node.js for Backend?

| Feature | Explanation |
|---------|-------------|
| **Single-threaded, event-driven** | Uses one thread with an event loop instead of spawning threads per request. This makes it lightweight and efficient for I/O-heavy tasks (reading files, database queries, API calls). |
| **Non-blocking I/O** | When Node reads a file or queries a DB, it doesn't wait. It fires the operation and moves on to the next request. When the operation completes, a callback runs. |
| **Same language frontend & backend** | You already know JavaScript from the browser — no need to learn Python/Java/PHP for server work. |
| **Massive ecosystem (npm)** | Over 2 million packages available. Need authentication? `npm install jsonwebtoken`. Need a database ORM? `npm install prisma`. |

### Real-World Usage

Node.js powers backends at Netflix, PayPal, LinkedIn, Uber, and Walmart. It excels at:
- REST APIs and GraphQL servers
- Real-time applications (chat, live feeds)
- Microservices architecture
- Server-side rendering (Next.js)

---

## 2. The `http` Module

Node.js ships with a built-in `http` module — no installation needed. It provides the lowest-level API for creating HTTP servers.

### How `http.createServer()` Works

```js
const http = require("http");

const server = http.createServer((req, res) => {
  // This callback fires for EVERY incoming HTTP request
  // req = IncomingMessage object (what the client sent)
  // res = ServerResponse object (what you send back)
});

server.listen(3000);
```

**Under the hood:**
1. `createServer()` creates a TCP server
2. `.listen(3000)` binds it to port 3000
3. When a client connects and sends an HTTP request, Node.js parses the raw TCP bytes into an `IncomingMessage` object (`req`)
4. Your callback runs — you inspect `req` and write to `res`
5. When you call `res.end()`, Node.js sends the response back over TCP

### The Event Loop

This is the key to understanding Node.js:

```
   ┌───────────────────────────┐
┌─>│         timers             │  ← setTimeout, setInterval
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │     pending callbacks      │  ← I/O callbacks
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │       idle, prepare        │
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │         poll               │  ← incoming connections, data
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │         check              │  ← setImmediate
│  └──────────┬────────────────┘
│  ┌──────────┴────────────────┐
│  │    close callbacks         │
│  └──────────┬────────────────┘
└─────────────┘
```

The event loop continuously checks for pending operations. When your server receives a request, it queues the callback. When the callback completes, it picks up the next one. This is why Node handles thousands of concurrent connections with a single thread.

---

## 3. Request Object (`req`)

The `req` object represents the incoming HTTP request from the client.

### Key Properties

| Property | Type | Example | Description |
|----------|------|---------|-------------|
| `req.method` | string | `"GET"`, `"POST"` | The HTTP method used |
| `req.url` | string | `"/api/items?page=2"` | The URL path + query string |
| `req.headers` | object | `{ "content-type": "application/json" }` | Request headers (all lowercase) |
| `req.httpVersion` | string | `"1.1"` | HTTP version |

### Reading the Request Body

Unlike frameworks, raw Node.js doesn't give you `req.body`. You must manually collect data chunks:

```js
let body = "";
req.on("data", (chunk) => {
  body += chunk.toString(); // Chunks arrive as Buffers
});
req.on("end", () => {
  const parsed = JSON.parse(body); // Now you have the body!
});
```

**Why chunks?** HTTP request bodies can be large (file uploads, big JSON). Node streams the data in pieces to avoid loading everything into memory at once.

---

## 4. Response Object (`res`) — Complete Reference

`res` is an instance of Node's `http.ServerResponse` class. Every method you call on it either configures the response (headers, status code) or sends data down the wire to the client.

The lifecycle looks like this:
```
1. Set headers     → res.setHeader() / res.writeHead()
2. Send body       → res.write()  (optional, for chunks)
3. Finish response → res.end()    (MUST always call this)
```

---

### `res.statusCode` — Set the HTTP Status Code

The simplest way to set a status code. Set it as a property before calling `res.end()`.

```js
const http = require("http");

http.createServer((req, res) => {
  // Scenario: Item not found in the store
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: "Item not found" }));
}).listen(3000);
```

If you never set `res.statusCode`, it defaults to `200`. Always set it explicitly for anything other than a success response.

```js
// Kiryana Store status code patterns:
res.statusCode = 200; // GET categories — success
res.statusCode = 201; // POST category — new record created
res.statusCode = 400; // Missing required field (name, price)
res.statusCode = 404; // Category ID doesn't exist
res.statusCode = 409; // Duplicate category name
res.statusCode = 500; // Unexpected database crash
```

---

### `res.setHeader(name, value)` — Set a Single Header

Sets one HTTP response header. Can be called multiple times for different headers. Must be called **before** `res.write()` or `res.end()`.

```js
http.createServer((req, res) => {
  // Tell the client what format the body is in
  res.setHeader("Content-Type", "application/json");

  // Custom headers are prefixed with X- by convention
  res.setHeader("X-Powered-By", "Kiryana Store API");
  res.setHeader("X-Request-Id", "req-" + Date.now());

  // CORS — allows the browser to accept this response from a different origin
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.statusCode = 200;
  res.end(JSON.stringify({ items: [] }));
}).listen(3000);
```

Calling `setHeader` twice with the same name **overwrites** the first value:
```js
res.setHeader("Content-Type", "text/plain");
res.setHeader("Content-Type", "application/json"); // Wins — plain text is gone
```

To set multiple values for one header (e.g. cookies):
```js
res.setHeader("Set-Cookie", ["session=abc; HttpOnly", "theme=dark"]);
// Sends both Set-Cookie headers separately to the client
```

---

### `res.getHeader(name)` — Read Back a Header You Set

Returns the value of a header you previously set with `setHeader`. Useful before deciding whether to override it:

```js
http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  const contentType = res.getHeader("Content-Type");
  console.log(contentType); // "application/json"

  res.end(JSON.stringify({ ok: true }));
}).listen(3000);
```

**Real use in Chapter 07:** One middleware sets a header, a later middleware reads it to decide whether to add more context.

---

### `res.removeHeader(name)` — Delete a Previously Set Header

Removes a header before it goes out. Useful when middleware sets a default you want to suppress:

```js
http.createServer((req, res) => {
  res.setHeader("X-Powered-By", "Node.js"); // Set somewhere earlier
  // ...
  res.removeHeader("X-Powered-By"); // Hide server info from attackers
  res.end(JSON.stringify({ ok: true }));
}).listen(3000);
```

**Real use in Chapter 15:** `helmet` calls `removeHeader("X-Powered-By")` automatically, so attackers can't identify your stack and target known vulnerabilities.

---

### `res.writeHead(statusCode, [headers])` — Set Status + Headers at Once

Sets the status code AND multiple headers in one call. More concise than setting them one by one. Can only be called **once** per response.

```js
http.createServer((req, res) => {
  // Return a paginated items list
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=60", // Browser can cache for 60 seconds
    "X-Total-Count": "42",                 // Total records (for pagination UI)
  });
  res.end(JSON.stringify({ data: [] }));
}).listen(3000);
```

**`writeHead` vs `setHeader` — when to use which:**

| | `setHeader` | `writeHead` |
|---|---|---|
| Call count | Many times | Once only |
| Style | Add headers one by one | Set all headers at once |
| Mixing | Can be mixed with `writeHead` | Merges headers set by `setHeader` |
| Use when | Building up headers in middleware | You know all headers at the point of sending |

You can mix both — headers from `setHeader` calls are merged in when `writeHead` is called:
```js
res.setHeader("X-Powered-By", "Kiryana Store"); // Set earlier
res.writeHead(201, { "Content-Type": "application/json" }); // Finalise
res.end(JSON.stringify({ data: newCategory }));
// Both X-Powered-By and Content-Type are sent
```

Once `writeHead` is called, `setHeader` will throw. Headers are already on the wire.

---

### `res.write(chunk)` — Send Body in Chunks (Streaming)

Sends a piece of the response body without finishing the response. You can call it multiple times. Headers are sent automatically on the first `write()` call.

```js
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });

  res.write("Kiryana Store\n");
  res.write("Items: Sugar, Rice, Milk\n");
  res.write("Total: Rs.193\n");

  res.end(); // Signal that we're done — no body here
}).listen(3000);
```

**Real use — streaming a large CSV export (Chapter 14):**
```js
http.createServer(async (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/csv",
    "Content-Disposition": "attachment; filename=items.csv",
  });

  res.write("name,price,stock\n"); // CSV header row, sent immediately

  const items = await getItemsFromDB(); // Say, 10,000 rows
  for (const item of items) {
    res.write(`${item.name},${item.price},${item.stock}\n`);
    // Each row sent right away — client starts downloading immediately
    // Never holds all 10,000 rows in memory at once
  }

  res.end();
}).listen(3000);
```

Without streaming you'd build a 5MB string in memory first, then send. With `write()` the client starts receiving data immediately and memory stays low.

---

### `res.end([data])` — Finish the Response

Signals that the response is complete. You **must always call this** — if you don't, the client hangs waiting forever and Node holds the connection open.

```js
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });

  // Pattern 1: send final data + end in one call (most common for APIs)
  res.end(JSON.stringify({ message: "Welcome to Kiryana Store" }));
}).listen(3000);
```

Three valid usage patterns:
```js
// 1. Body + finish in one call (most common)
res.end(JSON.stringify({ data: items }));

// 2. Stream chunks, then end with no data
res.write(chunk1);
res.write(chunk2);
res.end();

// 3. Empty body (for 204 No Content — used on DELETE)
res.statusCode = 204;
res.end();
```

What happens if you forget `res.end()`:
```js
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "application/json" });
  // No res.end() — browser spins forever, connection eventually times out
}).listen(3000);
```

---

### `res.headersSent` — Check If Response Has Started

A read-only boolean. Becomes `true` the moment `write()` or `end()` is called (because sending body implicitly sends headers). Use it as a guard to avoid the dreaded "headers already sent" crash:

```js
http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  try {
    const data = processRequest(req); // Might throw
    res.end(JSON.stringify({ data }));
  } catch (error) {
    if (!res.headersSent) {
      // Safe to send error response — nothing has gone out yet
      res.statusCode = 500;
      res.end(JSON.stringify({ error: error.message }));
    }
    // If headersSent is true: response already started, can't send a new one
  }
}).listen(3000);
```

---

### `res.on("finish", callback)` — After Response Is Fully Sent

The `finish` event fires after all data has been flushed to the network. At this point `res.statusCode` is set and you know the exact outcome. Perfect for logging:

```js
http.createServer((req, res) => {
  const startTime = Date.now();

  // Register BEFORE calling end() — the event fires later
  res.on("finish", () => {
    const ms = Date.now() - startTime;
    const color = res.statusCode >= 400 ? "\x1b[31m" : "\x1b[32m"; // Red / Green
    const reset = "\x1b[0m";
    console.log(`${req.method} ${req.url} → ${color}${res.statusCode}${reset} (${ms}ms)`);
  });

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "OK" }));
}).listen(3000);

// Console:
// GET /api/categories → 200 (12ms)
// POST /api/categories → 201 (45ms)
// GET /api/categories/999 → 404 (3ms)
```

Why use `finish` instead of logging right before `res.end()`? Because with streaming you call `write()` many times before `end()`. The `finish` event always fires at the true end regardless.

---

### `res.on("close", callback)` — If Client Disconnects Early

Fires if the client drops the connection before you finish sending (e.g. user refreshes mid-download). Use it to cancel expensive work:

```js
http.createServer(async (req, res) => {
  let cancelled = false;

  res.on("close", () => {
    cancelled = true;
    console.log("Client disconnected — stopping report generation");
  });

  res.writeHead(200, { "Content-Type": "application/json" });

  for (let i = 0; i < 1000; i++) {
    if (cancelled) break;          // Stop burning CPU for a gone client
    res.write(JSON.stringify({ row: i }) + "\n");
    await sleep(10);               // Simulate slow generation
  }

  if (!cancelled) res.end();
}).listen(3000);
```

**`finish` vs `close`:**

| Event | Fires when | Use for |
|-------|-----------|---------|
| `finish` | Server sent all data successfully | Logging, metrics |
| `close` | Connection closed (either side, including early disconnect) | Cleanup, stopping background work |

---

### Putting It All Together — A Full Kiryana Store Handler

```js
const http = require("http");
const url  = require("url");

const categories = [
  { id: "1", name: "Dairy",  description: "Milk products" },
  { id: "2", name: "Grains", description: "Rice, wheat, flour" },
];

http.createServer((req, res) => {
  const start = Date.now();
  const { pathname } = url.parse(req.url);

  // ── Log every request on finish ─────────────────────────
  res.on("finish", () => {
    console.log(`${req.method} ${pathname} → ${res.statusCode} (${Date.now() - start}ms)`);
  });

  // ── Set common headers for all responses ────────────────
  res.setHeader("Content-Type", "application/json");
  res.setHeader("X-Powered-By", "Kiryana Store");

  // ── GET /categories ─────────────────────────────────────
  if (req.method === "GET" && pathname === "/categories") {
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, data: categories }));
    return;
  }

  // ── GET /categories/:id ─────────────────────────────────
  const match = pathname.match(/^\/categories\/(\w+)$/);
  if (req.method === "GET" && match) {
    const category = categories.find((c) => c.id === match[1]);
    if (!category) {
      res.statusCode = 404;
      res.end(JSON.stringify({ success: false, error: `Category ${match[1]} not found` }));
      return;
    }
    res.statusCode = 200;
    res.end(JSON.stringify({ success: true, data: category }));
    return;
  }

  // ── POST /categories ────────────────────────────────────
  if (req.method === "POST" && pathname === "/categories") {
    let body = "";
    req.on("data", (chunk) => { body += chunk.toString(); });
    req.on("end", () => {
      try {
        const { name } = JSON.parse(body);
        if (!name) {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: "'name' is required" }));
          return;
        }
        const newCat = { id: String(categories.length + 1), name };
        categories.push(newCat);
        res.writeHead(201, { "Location": `/categories/${newCat.id}` });
        res.end(JSON.stringify({ success: true, data: newCat }));
      } catch {
        if (!res.headersSent) {  // Guard against double-response
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: "Invalid JSON body" }));
        }
      }
    });
    return;
  }

  // ── 404 — No route matched ──────────────────────────────
  res.statusCode = 404;
  res.end(JSON.stringify({ success: false, error: `Cannot ${req.method} ${pathname}` }));

}).listen(3000, () => console.log("Server on http://localhost:3000"));
```

---

### Rules Summary

| Rule | Why |
|------|-----|
| Always call `res.end()` | Without it the client waits forever; Node holds the connection |
| Set headers before body | After `write()` / `end()` headers are locked — throws if you try |
| One response per request | Calling `end()` twice throws `Error: write after end` |
| `return` after every response | Stops code continuing and trying to send a second response |
| Check `res.headersSent` in error handlers | Prevents the "headers already sent" crash in try/catch blocks |

---

## 5. HTTP Status Codes

Status codes tell the client what happened. They are grouped by category:

### 2xx — Success
| Code | Name | When to Use |
|------|------|-------------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (new resource created) |
| 204 | No Content | Successful DELETE (nothing to return) |

### 4xx — Client Errors
| Code | Name | When to Use |
|------|------|-------------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not allowed |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate entry |

### 5xx — Server Errors
| Code | Name | When to Use |
|------|------|-------------|
| 500 | Internal Server Error | Unhandled exception, bug |
| 502 | Bad Gateway | Proxy/upstream server failed |
| 503 | Service Unavailable | Server overloaded or in maintenance |

---

## 6. Manual Routing

Without a framework, you route by checking `req.method` and `req.url`:

```js
const routeKey = `${req.method} ${req.url}`;

const routes = {
  "GET /":       handleHome,
  "GET /health": handleHealth,
  "POST /echo":  handleEcho,
};

const handler = routes[routeKey] || handleNotFound;
handler(req, res);
```

**Limitation:** This approach doesn't support URL parameters (like `/users/:id`). You'd have to parse them manually with regex or `URL` class. This is exactly why Express was created.

---

## 7. `nodemon` — Auto-Restart on Changes

During development, you don't want to manually stop and restart the server every time you change code.

```bash
# Without nodemon — painful
node server.js         # Start
# Make a change...
Ctrl+C                 # Stop
node server.js         # Start again

# With nodemon — automatic
npx nodemon server.js  # Watches files, auto-restarts on save
```

**How it works:** nodemon watches your project files for changes. When a `.js` file is saved, it kills the Node process and starts it again automatically.

---

## 8. Content-Type Header

The `Content-Type` header tells the client what format the response body is in:

| Content-Type | Format |
|-------------|--------|
| `application/json` | JSON data |
| `text/html` | HTML page |
| `text/plain` | Plain text |
| `text/css` | CSS stylesheet |
| `image/png` | PNG image |

For APIs, you'll almost always use `application/json`.

---

## 9. Code Walkthrough: `server.js`

### `sendJSON()` Helper
```js
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "X-Powered-By": "Kiryana Store",
  });
  res.end(JSON.stringify(data));
}
```
**Why?** Without this, you'd write 3 lines every time you send JSON. The helper:
1. Sets the correct Content-Type header
2. Sets a custom X-Powered-By header (optional, but common)
3. Converts the JavaScript object to a JSON string
4. Sends it and finishes the response

### Route Object Pattern
```js
const routes = {
  "GET /": handleHome,
  "GET /health": handleHealth,
};
```
**Why?** Instead of a long `if/else if` chain, we use an object lookup — O(1) time complexity vs O(n) for if/else. This is a common pattern called a **dispatch table** or **route map**.

### Request Timing
```js
const start = Date.now();
res.on("finish", () => {
  const duration = Date.now() - start;
  console.log(`${req.method} ${req.url} → ${res.statusCode} (${duration}ms)`);
});
```
**Why?** Logging request duration helps you identify slow endpoints. The `finish` event fires after the response is fully sent. We capture `Date.now()` before and after to calculate the duration.

---

## 10. Summary

| Concept | What You Learned |
|---------|-----------------|
| Node.js | JavaScript runtime for server-side code |
| `http.createServer()` | Creates a raw HTTP server |
| `req` | Incoming request: method, URL, headers, body |
| `res` | Outgoing response: writeHead, write, end |
| Status codes | 200 OK, 201 Created, 404 Not Found, 500 Error |
| Manual routing | Object lookup with `METHOD /path` keys |
| nodemon | Auto-restart on file changes |
| Content-Type | Tells the client what format the data is in |

**Next Chapter →** We replace all this manual work with Express.js, which handles routing, body parsing, and headers automatically.
