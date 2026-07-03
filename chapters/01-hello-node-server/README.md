# Chapter 01 — Hello Node Server 🟢

## What You'll Learn
- How to create an HTTP server using Node.js `http` module (no frameworks!)
- Understanding `req` (request) and `res` (response) objects
- Manual URL routing
- JSON responses, status codes, and headers
- Auto-restarting with `nodemon`

## Why Start Without Express?
Before using any framework, it's important to understand what happens *under the hood*. Express is built on top of Node's `http` module. When you know how raw HTTP works, Express becomes intuitive instead of magical.

## Key Concepts

### 1. `http.createServer(callback)`
Node.js ships with a built-in `http` module. The `createServer` method takes a callback that fires on **every** incoming request.

```js
const server = http.createServer((req, res) => {
  // req = incoming request info (URL, method, headers, body)
  // res = object you use to send a response back
});
```

### 2. Request Properties
- `req.method` — HTTP method: `GET`, `POST`, `PUT`, `DELETE`
- `req.url` — The path: `/`, `/health`, `/api/data`
- `req.headers` — Object containing all request headers

### 3. Response Methods
- `res.writeHead(statusCode, headers)` — Set status + headers
- `res.write(chunk)` — Write partial response body
- `res.end(body)` — Finish the response (must always be called!)

### 4. Status Codes
| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 404 | Not Found |
| 500 | Internal Server Error |

## How to Run

```bash
cd chapters/01-hello-node-server
npm install
npm run dev     # starts with nodemon (auto-restart on changes)
npm start       # starts without auto-restart
```

Then visit: `http://localhost:3000`

## Test the Routes

```bash
# Home
curl http://localhost:3000/

# Health check
curl http://localhost:3000/health

# About
curl http://localhost:3000/about

# 404 test
curl http://localhost:3000/unknown
```

---

## 🏠 Homework

1. **`POST /echo`** — Read the request body and send it back as JSON. Hint: you need to collect chunks from `req.on('data')` and parse in `req.on('end')`.

2. **`GET /time`** — Return the current server time as:
   ```json
   { "time": "2024-01-15T10:30:00.000Z", "formatted": "Monday, January 15, 2024" }
   ```

3. **Better 404** — Update the 404 handler to return proper JSON:
   ```json
   { "error": "Not Found", "message": "Route GET /unknown does not exist", "statusCode": 404 }
   ```

---

## 💡 Tips
- Use `JSON.stringify()` to convert objects to JSON strings
- Set the `Content-Type` header to `application/json` for all JSON responses
- `nodemon` watches for file changes and auto-restarts — no need to manually stop/start!
