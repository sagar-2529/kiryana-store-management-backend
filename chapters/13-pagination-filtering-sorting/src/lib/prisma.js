const { PrismaClient } = require("@prisma/client");
const g = globalThis; const prisma = g.prisma || new PrismaClient({ log: ["warn", "error"] });
if (process.env.NODE_ENV !== "production") g.prisma = prisma; module.exports = prisma;
