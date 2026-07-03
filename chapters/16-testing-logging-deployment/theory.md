# Chapter 16 — Theory: Testing, Logging & Deployment

---

## 1. Testing Pyramid

```
        /  E2E Tests   \       Few: Full user flows (browser)
       / Integration    \      Some: API routes + database
      /   Unit Tests     \     Many: Individual functions
```

| Type | Speed | Scope | Tools |
|------|-------|-------|-------|
| **Unit** | Fast (ms) | Single function | Jest |
| **Integration** | Medium (s) | Route + DB | Jest + Supertest |
| **E2E** | Slow (min) | Full application | Cypress, Playwright |

### Jest Basics

```js
describe("Category Service", () => {
  it("should create a category", async () => {
    const result = await createCategory({ name: "Dairy" });
    expect(result.name).toBe("Dairy");
    expect(result.id).toBeDefined();
  });

  it("should reject empty name", async () => {
    await expect(createCategory({ name: "" }))
      .rejects.toThrow("Name is required");
  });
});
```

**Key functions:**
- `describe()` — groups related tests
- `it()` / `test()` — individual test case
- `expect()` — assertions
- `beforeAll()` / `afterAll()` — setup/teardown
- `beforeEach()` / `afterEach()` — per-test setup/teardown

### Supertest — Testing HTTP Routes

```js
const request = require("supertest");
const app = require("../src/app"); // Import app WITHOUT starting server

const res = await request(app)
  .post("/api/v1/categories")
  .send({ name: "Dairy" })
  .expect(201);

expect(res.body.success).toBe(true);
```

Supertest creates a test server internally — no port conflicts, no manual start/stop.

---

## 2. Structured Logging with Winston

### Why Not Just `console.log`?

| `console.log` | Winston |
|--------------|---------|
| Plain text | Structured JSON |
| No log levels | `error`, `warn`, `info`, `debug` |
| Console only | Console + files + external services |
| No timestamps | Automatic timestamps |
| No metadata | Request ID, user, context |

### Winston Setup

```js
const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});
```

### Log Levels (highest to lowest)
```
error → Something broke, needs immediate attention
warn  → Something unexpected, but app continues
info  → Normal operations (server started, request processed)
debug → Detailed info for development debugging
```

### Usage
```js
logger.info("Purchase created", { purchaseId: "abc", total: 500 });
logger.error("Database connection failed", { error: err.message });
```

**Output (JSON):**
```json
{"level":"info","message":"Purchase created","purchaseId":"abc","total":500,"timestamp":"2024-01-15T10:30:00.000Z"}
```

Structured JSON logs can be parsed by log aggregation tools (ELK Stack, Datadog, CloudWatch).

---

## 3. Docker

### What is Docker?

Docker packages your app + its dependencies into a **container** — a lightweight, isolated environment that runs the same everywhere.

```
"Works on my machine" → "Works in the container" → "Works in production"
```

### Dockerfile

```dockerfile
FROM node:20-alpine          # Base image (Node.js on lightweight Alpine Linux)
WORKDIR /app                 # Set working directory
COPY package*.json ./        # Copy dependency files first (Docker layer caching)
RUN npm ci --only=production # Install deps (ci = clean install, faster)
COPY . .                     # Copy source code
RUN npx prisma generate      # Generate Prisma Client
EXPOSE 3000                  # Document the port (doesn't actually publish)
CMD ["node", "src/server.js"] # Start command
```

**Layer caching:** Docker caches each step. If `package.json` hasn't changed, `npm ci` isn't re-run. Only changed layers rebuild.

### Docker Compose

Runs multiple services together:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: kiryana_store
  app:
    build: .
    depends_on: [db]
    environment:
      DATABASE_URL: postgresql://...@db:5432/kiryana_store
```

`docker-compose up` starts both PostgreSQL and your app with one command.

---

## 4. PM2 — Process Manager

```bash
pm2 start src/server.js --name kiryana-api
pm2 start src/server.js -i max  # Cluster mode (1 process per CPU core)
```

PM2 provides:
- **Auto-restart on crash** — if your app throws an uncaught exception, PM2 restarts it
- **Cluster mode** — run multiple instances for multi-core CPUs
- **Log management** — `pm2 logs`, `pm2 flush`
- **Monitoring** — `pm2 monit` shows CPU, memory, request count

---

## 5. Health Check Endpoint

```js
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`; // Test DB connectivity
    res.json({
      status: "healthy",
      uptime: process.uptime(),
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({ status: "unhealthy", database: "disconnected" });
  }
});
```

Load balancers and container orchestrators (Kubernetes, Docker) use health checks to determine if your app is running correctly.

---

## 6. Summary

| Concept | What You Learned |
|---------|-----------------|
| Testing pyramid | Unit → Integration → E2E |
| Jest | Test runner with `describe`, `it`, `expect` |
| Supertest | Test HTTP routes without starting a server |
| Winston | Structured logging with levels and transports |
| Docker | Containerize your app for consistent deployments |
| Docker Compose | Multi-service orchestration (app + database) |
| PM2 | Process manager with auto-restart and clustering |
| Health checks | Endpoint for monitoring system health |

**🎉 Congratulations!** You've completed the full course. You now have a production-grade understanding of Node.js backend engineering.
