# Chapter 04 — Prisma ORM Basics 🟢

## What You'll Learn
- What an ORM is and why we use Prisma
- Prisma schema → database migration workflow
- PrismaClient singleton pattern
- Database seeding with seed scripts
- Prisma Studio — visual database explorer

## ORM vs Raw SQL

| Aspect | Raw SQL | Prisma ORM |
|--------|---------|------------|
| Query style | `SELECT * FROM categories WHERE id = $1` | `prisma.category.findUnique({ where: { id } })` |
| Type safety | None | Full TypeScript types auto-generated |
| Migrations | Write SQL files manually | Auto-generated from schema changes |
| Relations | Manual JOINs | `include: { products: true }` |
| Learning curve | Need to know SQL | JavaScript-native API |

**Important:** You should STILL learn SQL. Prisma generates SQL under the hood — understanding it helps you write better queries and debug performance issues.

## Key Concepts

### 1. Prisma Workflow
```
Edit schema.prisma → Run migration → Generate client → Use in code
                     prisma migrate   prisma generate   PrismaClient
```

### 2. Migration Commands
```bash
# Create and apply a migration (development)
npx prisma migrate dev --name init

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: deletes all data!)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

### 3. Prisma Client Singleton
```js
// WRONG — creates a new connection on every import
const prisma = new PrismaClient();

// RIGHT — singleton pattern (one instance, reused everywhere)
// See lib/prisma.js in this chapter
```

### 4. Prisma Studio
```bash
npx prisma studio
# Opens a visual editor at http://localhost:5555
# You can browse, create, edit, and delete records!
```

### 5. Seeding
```bash
npx prisma db seed
# Runs the seed script defined in package.json
```

## Folder Structure

```
src/
├── app.js
├── server.js
├── lib/
│   └── prisma.js         ← PrismaClient singleton
├── routes/
│   └── category.routes.js
├── controllers/
│   └── category.controller.js  ← Now uses Prisma!
└── utils/
    └── response.js
prisma/
├── schema.prisma         ← Symlinked from root project
└── seed.js               ← Seed script
```

## How to Run

```bash
cd chapters/04-prisma-orm-basics

# 1. Install dependencies
npm install

# 2. Make sure your .env has the correct DATABASE_URL
#    (copy from the root project's .env)

# 3. Run the migration to create tables
npx prisma migrate dev --name init

# 4. Seed the database
npx prisma db seed

# 5. Start the server
npm run dev

# 6. (Optional) Open Prisma Studio in another terminal
npx prisma studio
```

## Test the Routes

```bash
# Get all categories (now from database!)
curl http://localhost:3000/api/v1/categories

# Create a category
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Beverages", "description": "Tea, coffee, juices"}'
```

---

## 🏠 Homework

1. **Expand the Seed** — Add 5 more categories and 3 products per category in `prisma/seed.js`. Run `npx prisma db seed` to verify.

2. **Prisma Studio Exploration** — Open Prisma Studio (`npx prisma studio`), manually create a Customer record, and verify it appears in the customers table.

3. **Test Connection Script** — Create `scripts/test-connection.js`:
   ```js
   // Connect to DB, count records in each table, print results, disconnect
   // Expected output:
   // Categories: 8
   // Products: 12
   // Customers: 1
   // Connection successful!
   ```

---

## 💡 Tips
- Always use the **singleton pattern** for PrismaClient — otherwise you'll exhaust your database connection pool
- `npx prisma migrate dev` is for development only — it can reset data. Use `migrate deploy` in production
- If you change the schema, always run `npx prisma generate` to update the client types
- Prisma Studio is amazing for debugging — use it to verify your seed data and test queries visually
