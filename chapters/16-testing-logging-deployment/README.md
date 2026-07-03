# Chapter 16 — Testing, Logging & Deployment 🔴

## What You'll Learn
- Unit tests vs Integration tests vs E2E tests
- Jest setup and test patterns
- Supertest for API integration testing
- Winston for structured logging
- Docker + Docker Compose
- PM2 process manager
- Health check endpoints

## Key Concepts

### Testing Pyramid
```
        /  E2E   \        Few, slow, expensive
       / Integration \     Some, moderate
      /    Unit Tests  \   Many, fast, cheap
```

### Jest Basics
```js
describe('Category Controller', () => {
  it('should create a category', async () => {
    const res = await request(app)
      .post('/api/v1/categories')
      .send({ name: 'Test Category' });
    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe('Test Category');
  });
});
```

### Winston Logger
```js
const winston = require('winston');
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["node", "src/server.js"]
```

## How to Run

```bash
cd chapters/16-testing-logging-deployment
npm install

# Run tests
npm test

# Run with logging
npm run dev

# Docker (if Docker is installed)
docker-compose up --build
```

---

## 🏠 Homework

1. **Customer Tests** — Write integration tests for Customer CRUD.
2. **Purchase Tests** — Write tests for the purchase flow (including credit).
3. **Request ID** — Middleware that assigns a UUID to every request and includes it in logs.
4. **Deploy** — Deploy to Render or Railway and share the URL.
