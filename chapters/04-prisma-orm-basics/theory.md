# Chapter 04 — Theory: Prisma ORM Basics

---

## 1. What is an ORM?

**ORM = Object-Relational Mapping.** It's a layer between your JavaScript code and the SQL database that lets you work with database tables as JavaScript objects.

```
JavaScript Object          SQL Table
─────────────────          ──────────
{ name: "Dairy" }    →    INSERT INTO categories (name) VALUES ('Dairy')
prisma.category.findMany() → SELECT * FROM categories
```

### Why Not Write Raw SQL?

| Concern | Raw SQL | Prisma ORM |
|---------|---------|-----------|
| **Typos** | `SELCT * FROM usrs` → runtime error | `prisma.user.findMany()` → compile-time autocomplete |
| **SQL injection** | Must manually parameterize every query | Prisma auto-parameterizes everything |
| **Migrations** | Write ALTER TABLE scripts by hand | Auto-generated from schema changes |
| **Relations** | Complex JOINs | `include: { products: true }` |
| **Type safety** | None — columns are strings until runtime | Full TypeScript types auto-generated |

**Important caveat:** ORMs aren't a replacement for SQL knowledge. Complex queries, performance tuning, and debugging require understanding the SQL that Prisma generates. You should still learn SQL.

---

## 2. Prisma Architecture

Prisma consists of three parts:

```
┌──────────────────────────────────────┐
│         schema.prisma                │  ← You define your data model here
│  (models, relations, enums)          │
└──────────────────┬───────────────────┘
                   │  npx prisma generate
                   ▼
┌──────────────────────────────────────┐
│        Prisma Client                 │  ← Auto-generated query builder
│  (JavaScript API to your database)   │
└──────────────────┬───────────────────┘
                   │  SQL queries
                   ▼
┌──────────────────────────────────────┐
│        PostgreSQL Database           │  ← Your actual data
│  (tables, rows, indexes)             │
└──────────────────────────────────────┘
```

### The Workflow

```
1. Define models in schema.prisma
2. Run `npx prisma migrate dev` → creates SQL migration files + applies them
3. Run `npx prisma generate` → generates the Prisma Client (happens automatically with migrate)
4. Import PrismaClient in your code → use it to query the database
```

---

## 3. Prisma Schema (`schema.prisma`)

The schema file is the **single source of truth** for your database structure.

### Generator Block
```prisma
generator client {
  provider = "prisma-client-js"
}
```
Tells Prisma to generate a JavaScript client. Other generators exist for GraphQL schemas, documentation, etc.

### Datasource Block
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
Connects to PostgreSQL. `env("DATABASE_URL")` reads from your `.env` file. Prisma also supports MySQL, SQLite, MongoDB, and SQL Server.

### Model Definition
```prisma
model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  adminId     String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  admin    Admin     @relation(fields: [adminId], references: [id])
  products Product[]
}
```

| Prisma Syntax | SQL Equivalent | Meaning |
|---------------|---------------|---------|
| `@id` | `PRIMARY KEY` | This field is the primary key |
| `@default(uuid())` | `DEFAULT gen_random_uuid()` | Auto-generate UUID |
| `@unique` | `UNIQUE` constraint | No duplicate values |
| `String?` | `VARCHAR NULL` | Optional (nullable) field |
| `@default(now())` | `DEFAULT NOW()` | Auto-set to current timestamp |
| `@updatedAt` | Managed by Prisma | Auto-updates on every save |
| `@relation` | `FOREIGN KEY` | Links to another table |
| `Product[]` | One-to-many | A category has many products |

### `@@map("table_name")`
```prisma
@@map("categories")
```
Maps the Prisma model name `Category` (PascalCase, singular) to the SQL table name `categories` (lowercase, plural). Without this, Prisma would create a table called `Category`.

---

## 4. Migrations

Migrations are **versioned SQL scripts** that modify your database schema. They're like "git commits for your database."

### Why Migrations?

Without migrations:
```
Developer A: "I added a 'phone' column to users"
Developer B: "I don't have that column... my app crashes"
```

With migrations:
```
Developer A creates migration: 20240115_add_phone_to_users.sql
Developer B runs: npx prisma migrate dev
→ The column is added automatically
```

### Migration Commands

```bash
# Create a new migration (development)
npx prisma migrate dev --name add_phone_column
```
**What happens:**
1. Prisma compares current schema with the database
2. Generates a SQL migration file (in `prisma/migrations/`)
3. Applies the migration to the database
4. Regenerates the Prisma Client

```bash
# Apply pending migrations (production)
npx prisma migrate deploy
```
Only applies. Never generates. Never resets. Safe for production.

```bash
# Reset everything (development only!)
npx prisma migrate reset
```
**WARNING:** Drops the entire database, recreates it, applies all migrations, runs seed. All data is lost.

### Migration Files
```
prisma/migrations/
├── 20240115120000_init/
│   └── migration.sql    ← CREATE TABLE categories (...); CREATE TABLE products (...);
├── 20240120150000_add_phone/
│   └── migration.sql    ← ALTER TABLE customers ADD COLUMN phone VARCHAR;
└── migration_lock.toml  ← Prevents concurrent migrations
```

Each migration is a folder with a timestamp + name. The SQL file contains the exact SQL that was executed.

---

## 5. PrismaClient — The Query Builder

### Basic CRUD Operations

```js
const prisma = require("./lib/prisma");

// CREATE
const category = await prisma.category.create({
  data: { name: "Dairy", description: "Milk products", adminId: "abc" },
});

// READ (many)
const categories = await prisma.category.findMany({
  orderBy: { name: "asc" },
});

// READ (one)
const category = await prisma.category.findUnique({
  where: { id: "some-uuid" },
});

// UPDATE
const updated = await prisma.category.update({
  where: { id: "some-uuid" },
  data: { name: "New Name" },
});

// DELETE
await prisma.category.delete({
  where: { id: "some-uuid" },
});

// COUNT
const total = await prisma.category.count();
```

### Relation Loading

```js
// Include related data (SQL JOIN)
const category = await prisma.category.findUnique({
  where: { id },
  include: {
    products: true,  // All products in this category
  },
});
// Result: { id, name, products: [{ id, name }, { id, name }] }

// Count related records (without loading)
const categories = await prisma.category.findMany({
  include: {
    _count: { select: { products: true } },
  },
});
// Result: [{ id, name, _count: { products: 5 } }]

// Selective fields
const categories = await prisma.category.findMany({
  select: { id: true, name: true }, // Only these fields
});
```

### `include` vs `select`
| Feature | `include` | `select` |
|---------|----------|----------|
| Returns | All fields + included relations | Only specified fields |
| Use when | You want everything + some relations | You want minimal data |
| Performance | Fetches more data | Fetches less data |

---

## 6. The Singleton Pattern

### The Problem

```js
// ❌ BAD — every import creates a new connection pool!
// file1.js
const prisma = new PrismaClient(); // Connection pool 1

// file2.js
const prisma = new PrismaClient(); // Connection pool 2

// file3.js
const prisma = new PrismaClient(); // Connection pool 3
// 💥 Database runs out of connections!
```

### The Solution

```js
// lib/prisma.js — ONE instance shared across the entire app
const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
```

**How it works:**
1. First import: `globalThis.prisma` is `undefined` → creates new PrismaClient
2. Stores it on `globalThis.prisma` (survives hot-reload in development)
3. Second import: `globalThis.prisma` exists → reuses it
4. Result: ONE PrismaClient, ONE connection pool, shared everywhere

### Why `globalThis`?

In development with nodemon, when you save a file, the module cache is cleared and re-executed. Without `globalThis`, each restart creates a new PrismaClient (old one isn't garbage-collected immediately). `globalThis` survives module reloads.

---

## 7. Database Seeding

Seed scripts populate your database with initial data for development and testing.

```js
// prisma/seed.js
async function main() {
  await prisma.category.deleteMany(); // Clean slate
  await prisma.category.create({ data: { name: "Dairy", ... } });
}
main().finally(() => prisma.$disconnect());
```

### When to Seed?
- After `npx prisma migrate reset` (happens automatically if configured)
- Setting up a new development environment
- Loading test fixtures before running tests

### Seed Script Config
```json
// package.json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```
Now `npx prisma db seed` knows which script to run.

---

## 8. Prisma Studio

```bash
npx prisma studio
# Opens http://localhost:5555
```

A visual database editor in your browser. You can:
- Browse all tables and their data
- Create, edit, and delete records
- Filter and search
- See relations visually

**Real-world use:** Debugging. "Why isn't this customer showing up?" → Open Prisma Studio → Check if the record exists → See its relations.

---

## 9. Prisma Error Codes

When operations fail, Prisma throws errors with specific codes:

| Code | Meaning | Example | HTTP Status |
|------|---------|---------|-------------|
| P2002 | Unique constraint violation | Duplicate category name | 409 |
| P2003 | Foreign key constraint failure | Invalid `categoryId` | 400 |
| P2025 | Record not found (for update/delete) | Update non-existent ID | 404 |
| P2014 | Relation violation | Deleting a record with references | 400 |
| P2021 | Table doesn't exist | Missing migration | 500 |

Handle them in your controllers:
```js
try {
  await prisma.category.create({ data: { name: "Dairy" } });
} catch (error) {
  if (error.code === "P2002") {
    return res.status(409).json({ error: "Already exists" });
  }
  throw error; // Re-throw unknown errors
}
```

---

## 10. Summary

| Concept | What You Learned |
|---------|-----------------|
| ORM | Maps database tables to JavaScript objects |
| Prisma schema | Single source of truth for data model |
| Migrations | Versioned SQL changes, like git for databases |
| PrismaClient | Auto-generated query builder |
| Singleton pattern | One PrismaClient instance shared across app |
| CRUD methods | `create`, `findMany`, `findUnique`, `update`, `delete` |
| Relations | `include` for JOINs, `_count` for counts |
| Seeding | Populate database with initial development data |
| Prisma Studio | Visual database editor at localhost:5555 |
| Error codes | P2002 (duplicate), P2025 (not found), etc. |

**Next Chapter →** We build full CRUD routes for Category and Product models, applying everything we've learned so far.
