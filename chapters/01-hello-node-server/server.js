// ============================================================
// Chapter 01 — Raw Node.js HTTP Server
// No frameworks, no libraries — just pure Node.js
// ============================================================

const http = require("http");

// ── Configuration ───────────────────────────────────────────
const PORT = 3000;
const HOST = "localhost";

// ── Helper: send a JSON response ────────────────────────────
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "X-Powered-By": "Kiryana Store",
  });
  res.end(JSON.stringify(data));
}

// ── Route Handlers ──────────────────────────────────────────
function handleHome(req, res) {
  sendJSON(res, 200, {
    message: "Welcome to Kiryana Store API 🏪",
    version: "1.0.0",
    routes: ["/", "/health", "/about"],
  });
}

function handleHealth(req, res) {
  sendJSON(res, 200, {
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

function handleAbout(req, res) {
  sendJSON(res, 200, {
    name: "Kiryana Store Backend",
    description:
      "A credit and purchase management system for general stores",
    author: "You!",
    nodeVersion: process.version,
  });
}

function handleNotFound(req, res) {
  sendJSON(res, 404, {
    error: "Not Found",
    message: `Cannot ${req.method} ${req.url}`,
  });
}

// ── Router ──────────────────────────────────────────────────
// Maps "METHOD /path" → handler function
const routes = {
  "GET /": handleHome,
  "GET /health": handleHealth,
  "GET /about": handleAbout,
  // ──────────────────────────────────────────────
  // HOMEWORK: Add these routes
  // "POST /echo": handleEcho,
  // "GET /time": handleTime,
  // ──────────────────────────────────────────────
};

// ── Create Server ───────────────────────────────────────────
const server = http.createServer((req, res) => {
  // Build a route key: "GET /" , "POST /echo", etc.
  const routeKey = `${req.method} ${req.url}`;

  // Log every incoming request
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toLocaleTimeString()}] ${req.method} ${req.url} → ${res.statusCode} (${duration}ms)`
    );
  });

  // Find and execute the matching handler, or 404
  const handler = routes[routeKey] || handleNotFound;
  handler(req, res);
});

// ── Start Listening ─────────────────────────────────────────
server.listen(PORT, HOST, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   🏪 Kiryana Store — Chapter 01          ║
  ║   Server running on http://${HOST}:${PORT}  ║
  ╚═══════════════════════════════════════════╝
  `);
});
