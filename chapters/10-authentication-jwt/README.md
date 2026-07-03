# Chapter 10 — Authentication with JWT 🔴

## What You'll Learn
- Password hashing with `bcryptjs` (salt rounds, compare)
- JSON Web Tokens (JWT): sign, verify, expiry
- Auth middleware that protects routes
- Public vs protected route patterns
- Refresh token concept (theory)

## Key Concepts

### Password Hashing
```js
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('password123', 12); // 12 salt rounds
const isMatch = await bcrypt.compare('password123', hash); // true
```
NEVER store plain-text passwords. Hashing is one-way — you can't reverse it.

### JWT Flow
```
1. Client sends email + password → POST /auth/login
2. Server verifies credentials
3. Server creates JWT with payload { adminId, email }
4. Client stores JWT
5. Client sends JWT in Authorization: Bearer <token>
6. Server middleware verifies JWT on protected routes
```

### JWT Structure
```
header.payload.signature
eyJhb...   ← Base64 encoded, NOT encrypted!
```

## How to Run

```bash
cd chapters/10-authentication-jwt
npm install
npm run dev
```

## Test the Flow

```bash
# Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@store.com","password":"secret123"}'

# Login (get JWT)
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@store.com","password":"secret123"}'

# Use JWT on protected route
curl http://localhost:3000/api/v1/categories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## 🏠 Homework

1. **`GET /api/v1/auth/me`** — Return logged-in admin's profile from JWT.
2. **`PUT /api/v1/auth/change-password`** — Require old password, set new one.
3. **Protect All Mutations** — Apply `authMiddleware` to all POST/PUT/DELETE routes.
4. **Role-Based Access** — Only `SUPER_ADMIN` role can delete categories.
