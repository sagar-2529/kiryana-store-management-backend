require("dotenv").config();
const app = require("./app");
const prisma = require("./lib/prisma");
const PORT = process.env.PORT || 3000;

async function start() {
  await prisma.$connect();
  app.listen(PORT, () => console.log(`🏪 Chapter 09 running on http://localhost:${PORT}`));
}

// Safety nets for unhandled errors
process.on("unhandledRejection", (reason) => {
  console.error("💥 UNHANDLED REJECTION:", reason);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("💥 UNCAUGHT EXCEPTION:", error);
  process.exit(1);
});

process.on("SIGINT", async () => { await prisma.$disconnect(); process.exit(0); });
start().catch((e) => { console.error("❌", e); process.exit(1); });
