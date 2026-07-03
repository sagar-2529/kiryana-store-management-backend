require("dotenv").config();
const app = require("./app");
const prisma = require("./lib/prisma");
const PORT = process.env.PORT || 3000;
async function start() {
  await prisma.$connect();
  console.log("✅ Database connected");
  app.listen(PORT, () => console.log(`🏪 Chapter 05 running on http://localhost:${PORT}`));
}
process.on("SIGINT", async () => { await prisma.$disconnect(); process.exit(0); });
start().catch((e) => { console.error("❌", e); process.exit(1); });
