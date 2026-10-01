require("dotenv").config();

const app = require("./app");
const prisma = require("./lib/prisma");
const port = Number(process.env.PORT) || 3000;

async function start() {
  await prisma.$connect();
  const server = app.listen(port, () => {
    console.log(`Kiryana Store API listening on port ${port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

start().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
