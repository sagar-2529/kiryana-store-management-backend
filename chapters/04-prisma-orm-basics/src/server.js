// ============================================================
// Chapter 04 — Server Entry Point
// ============================================================

require("dotenv").config();
const app = require("./app");
const prisma = require("./lib/prisma");

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("✅ Database connected");

    app.listen(PORT, () => {
      console.log(`
  ╔═══════════════════════════════════════════╗
  ║   🏪 Kiryana Store — Chapter 04          ║
  ║   http://localhost:${PORT}                  ║
  ║   Database: PostgreSQL (Prisma)          ║
  ║   Routes: /api/v1/categories             ║
  ╚═══════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
