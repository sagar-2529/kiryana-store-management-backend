require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
    adapter, // 👈 REQUIRED in Prisma v7
});

async function main() {
    console.log("🔌 Testing database connection...\n");

    const categories = await prisma.category.count();
    const products = await prisma.product.count();
    const customers = await prisma.customer.count();

    console.log(`Categories: ${categories}`);
    console.log(`Products: ${products}`);
    console.log(`Customers: ${customers}`);

    console.log("\n✅ Connection successful!");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());