// ============================================================
// Prisma Client — Singleton Pattern
// ============================================================
// WHY A SINGLETON?
//
// Every `new PrismaClient()` opens a connection pool to your database.
// If you create a new instance in every file that imports this module,
// you'll quickly exhaust your database's connection limit.
//
// The singleton pattern ensures only ONE PrismaClient exists in your
// entire application, no matter how many files import it.
// ============================================================

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

// In development, hot-reloading (nodemon) re-runs the file,
// creating new PrismaClient instances. We store it on `global`
// to survive restarts.
const globalForPrisma = globalThis;

function createPrismaClient() {

  console.log("DATABASE_URL =", process.env.DATABASE_URL);
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });
}

const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
