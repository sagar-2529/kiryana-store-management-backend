# Chapter 10 — Theory: Authentication with JWT

---

## 1. Authentication vs Authorization

| Concept | Question | Example |
|---------|----------|---------|
| **Authentication** | "Who are you?" | Login with email + password |
| **Authorization** | "What can you do?" | Only admin can delete categories |

This chapter covers authentication. Authorization (roles, permissions) is homework.

---

## 2. Password Hashing with bcrypt

### Never Store Plain-Text Passwords!

If your database is breached and passwords are plain-text, attackers get every user's password. With hashing, they get meaningless strings.

### How bcrypt Works

```js
const bcrypt = require("bcryptjs");

// Hashing — one-way transformation
const hash = await bcrypt.hash("mypassword", 12);
// "$2a$12$K5w3t/M9bY..." — can't reverse this!

// Comparison — checks if password matches hash
const isMatch = await bcrypt.compare("mypassword", hash);
// true
```

**Salt rounds (12):** bcrypt adds random data ("salt") to the password before hashing. The number (12) controls how many rounds of hashing are performed. Higher = more secure but slower.

| Rounds | Time per Hash | Security |
|--------|--------------|----------|
| 10 | ~100ms | Minimum acceptable |
| 12 | ~300ms | Good balance ✅ |
| 14 | ~1s | High security |
| 16 | ~4s | Very slow |

### Why Not SHA-256?

SHA-256 is fast (~1 billion hashes/sec). Attackers can brute-force it. bcrypt is intentionally slow (~3 hashes/sec with 12 rounds). This makes brute-forcing impractical.

---

## 3. JSON Web Tokens (JWT)

### The Problem: HTTP is Stateless

Each HTTP request is independent. The server doesn't "remember" previous requests. So how does it know you're logged in?

**Sessions** (traditional): Server stores session data in memory/database. Sends a session ID cookie to the client. Client sends cookie with every request.

**JWT** (modern): Server creates a signed token containing user info. Client stores and sends the token. Server verifies the signature — no server-side storage needed.

### JWT Structure

```
eyJhbGciOiJIUzI1NiJ9.eyJhZG1pbklkIjoiYWJjIiwiZW1haWwiOiJ4QHkuY29tIn0.signature
└────── Header ───────┘.└──────────── Payload ─────────────────────────────────┘.└─ Sig ─┘
```

| Part | Contains | Encoded? | Encrypted? |
|------|----------|----------|------------|
| Header | Algorithm, type | Base64 | ❌ No! |
| Payload | User data (claims) | Base64 | ❌ No! |
| Signature | HMAC of header+payload+secret | — | ✅ Signed |

**⚠️ JWT is NOT encrypted!** Anyone can decode the header and payload. The signature only proves the token wasn't tampered with. Never put passwords or sensitive data in the payload.

### JWT Flow

```
1. POST /auth/login { email, password }
2. Server verifies credentials
3. Server creates JWT: jwt.sign({ adminId, email }, SECRET, { expiresIn: "7d" })
4. Server returns { token: "eyJ..." }
5. Client stores token (localStorage, cookie, etc.)
6. Client sends token: Authorization: Bearer eyJ...
7. Server verifies: jwt.verify(token, SECRET)
8. Server extracts admin from payload, attaches to req.admin
```

### `jwt.sign()` and `jwt.verify()`

```js
// Create token
const token = jwt.sign(
  { adminId: admin.id, email: admin.email },  // payload
  "your-secret-key",                           // secret
  { expiresIn: "7d" }                          // options
);

// Verify token
const decoded = jwt.verify(token, "your-secret-key");
// { adminId: "abc", email: "x@y.com", iat: 1234, exp: 5678 }
```

---

## 4. Auth Middleware

```js
const authMiddleware = async (req, res, next) => {
  // 1. Extract token from "Authorization: Bearer <token>"
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new UnauthorizedError("No token provided");

  // 2. Verify token signature and expiry
  const decoded = jwt.verify(token, SECRET);

  // 3. Check if user still exists in DB
  const admin = await prisma.admin.findUnique({ where: { id: decoded.adminId } });
  if (!admin) throw new UnauthorizedError("Admin not found");

  // 4. Attach to request for downstream use
  req.admin = admin;
  next();
};
```

### Protecting Routes

```js
// Public routes — no auth needed
router.post("/login", login);
router.post("/register", register);

// Protected routes — auth required
router.get("/me", authMiddleware, getMe);
router.post("/categories", authMiddleware, createCategory);
```

---

## 5. Summary

| Concept | What You Learned |
|---------|-----------------|
| Auth vs Authz | "Who are you?" vs "What can you do?" |
| bcrypt | One-way hashing with salt rounds |
| JWT | Signed tokens for stateless authentication |
| JWT structure | Header.Payload.Signature (not encrypted!) |
| Auth middleware | Extract → Verify → Check DB → Attach to req |

**Next Chapter →** Purchase flow with database transactions.
