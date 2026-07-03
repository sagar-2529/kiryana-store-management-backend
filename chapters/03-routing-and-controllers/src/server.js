// ============================================================
// Chapter 03 — Server Entry Point
// Separating app config from server start is a best practice
// (makes testing easier — you can import app without starting)
// ============================================================

require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   🏪 Kiryana Store — Chapter 03          ║
  ║   http://localhost:${PORT}                  ║
  ║   Routes: /api/v1/admin                  ║
  ║           /api/v1/categories             ║
  ╚═══════════════════════════════════════════╝
  `);
});
