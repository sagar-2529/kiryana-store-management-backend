require("dotenv").config(); const app = require("./app"); const prisma = require("./lib/prisma");
const fs = require("fs"); const path = require("path");
// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
const PORT = process.env.PORT || 3000;
async function start() { await prisma.$connect(); app.listen(PORT, () => console.log(`🏪 Chapter 14 on http://localhost:${PORT}`)); }
process.on("SIGINT", async () => { await prisma.$disconnect(); process.exit(0); });
start().catch((e) => { console.error("❌", e); process.exit(1); });
