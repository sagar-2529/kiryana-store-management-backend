require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const bcrypt = require("bcryptjs");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting seed...\n");

  // ── Clean existing data (order matters due to foreign keys) ──
  await prisma.creditTransaction.deleteMany();
  await prisma.purchaseItem.deleteMany();
  await prisma.purchase.deleteMany();
  await prisma.userCredit.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.item.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.admin.deleteMany();

  // ── Create Admin ──────────────────────────────────────────
  const admin = await prisma.admin.create({
    data: {
      name: "Store Owner",
      email: "owner@kiryana.com",
      password: "password123", // We'll hash this in Chapter 10!
    },
  });
  console.log(`✅ Admin created: ${admin.name} (${admin.email})`);

  // ── Create Categories ─────────────────────────────────────
  const dairy = await prisma.category.create({
    data: {
      name: "Dairy",
      description: "Milk, butter, paneer, curd, ghee",
      adminId: admin.id,
    },
  });

  const grains = await prisma.category.create({
    data: {
      name: "Grains & Pulses",
      description: "Rice, wheat, dal, flour, semolina",
      adminId: admin.id,
    },
  });

  const spices = await prisma.category.create({
    data: {
      name: "Spices & Masala",
      description: "Turmeric, chilli, cumin, garam masala",
      adminId: admin.id,
    },
  });

  const snacks = await prisma.category.create({
    data: {
      name: "Snacks",
      description: "Chips, namkeen, etc",
      adminId: admin.id,
    },
  });

  const stationary = await prisma.category.create({
    data: {
      name: "Stationary",
      description: "Note books, pens, pencils, etc",
      adminId: admin.id,
    },
  });


  const personalCare = await prisma.category.create({
    data: {
      name: "Personal Care",
      description: "Shampoo, soap, toothpaste, etc",
      adminId: admin.id,
    },
  });

  const homeEssentials = await prisma.category.create({
    data: {
      name: "Home Essentials",
      description: "Candles, matches, agarbatti, etc",
      adminId: admin.id,
    },
  });

  console.log(`✅ Categories created: ${dairy.name}, ${grains.name}, ${spices.name}`);

  // ── Create Products ───────────────────────────────────────
  const milk = await prisma.product.create({
    data: {
      name: "Milk",
      description: "Fresh packaged milk",
      categoryId: dairy.id,
    },
  });

  const rice = await prisma.product.create({
    data: {
      name: "Rice",
      description: "Basmati and non-basmati rice",
      categoryId: grains.id,
    },
  });

  const atta = await prisma.product.create({
    data: {
      name: "Atta",
      description: "Wheat flour",
      categoryId: grains.id,
    },
  });

  const dal = await prisma.product.create({
    data: {
      name: "Dal",
      description: "Various lentils and pulses",
      categoryId: grains.id,
    },
  });

  const chips = await prisma.product.create({
    data: {
      name: "Chips",
      description: "Potato chips",
      categoryId: snacks.id,
    },
  });

  const namkeen = await prisma.product.create({
    data: {
      name: "Namkeen",
      description: "Indian savory snack mix",
      categoryId: snacks.id,
    },
  });

  const biscuits = await prisma.product.create({
    data: {
      name: "Biscuits",
      description: "Cookies and biscuits",
      categoryId: snacks.id,
    },
  });

  const notebooks = await prisma.product.create({
    data: {
      name: "Notebooks",
      description: "Notebooks for students and professionals",
      categoryId: stationary.id,
    },
  });

  const pens = await prisma.product.create({
    data: {
      name: "Pens",
      description: "Pens for writing and drawing",
      categoryId: stationary.id,
    },
  });

  const pencils = await prisma.product.create({
    data: {
      name: "Pencils",
      description: "Pencils for writing and drawing",
      categoryId: stationary.id,
    },
  });

  const shampoo = await prisma.product.create({
    data: {
      name: "Shampoo",
      description: "Shampoo for washing hair",
      categoryId: personalCare.id,
    },
  });

  const soap = await prisma.product.create({
    data: {
      name: "Soap",
      description: "Soap for washing body",
      categoryId: personalCare.id,
    },
  });

  const toothpaste = await prisma.product.create({
    data: {
      name: "Toothpaste",
      description: "Toothpaste for brushing teeth",
      categoryId: personalCare.id,
    },
  });

  const candles = await prisma.product.create({
    data: {
      name: "Candles",
      description: "Candles for lighting",
      categoryId: homeEssentials.id,
    },
  });

  const matches = await prisma.product.create({
    data: {
      name: "Matches",
      description: "Matches for lighting",
      categoryId: homeEssentials.id,
    },
  });

  const agarbatti = await prisma.product.create({
    data: {
      name: "Agarbatti",
      description: "Incense sticks",
      categoryId: homeEssentials.id,
    },
  });

  console.log(`✅ Products created: ${milk.name}, ${rice.name}, ${dal.name}`);

  // ── Create Items (SKUs) ───────────────────────────────────
  const items = await Promise.all([
    prisma.item.create({
      data: {
        name: "Amul Taza 500ml",
        price: 28.0,
        unitType: "PACKET",
        stock: 50,
        productId: milk.id,
        categoryId: dairy.id,
      },
    }),
    prisma.item.create({
      data: {
        name: "Amul Gold 1L",
        price: 68.0,
        unitType: "PACKET",
        stock: 30,
        productId: milk.id,
        categoryId: dairy.id,
      },
    }),

    prisma.item.create({
      data: {
        name: "Basmati Rice (India Gate)",
        price: 120.0,
        unitType: "KG",
        stock: 100,
        productId: rice.id,
        categoryId: grains.id,
      },
    }),

    prisma.item.create({
      data: {
        name: "Atta (Aashirvad)",
        price: 110.0,
        unitType: "KG",
        stock: 90,
        productId: atta.id,
        categoryId: grains.id,
      },
    }),

    prisma.item.create({
      data: {
        name: "Apsara Pencil",
        price: 10.0,
        unitType: "PIECE",
        stock: 80,
        productId: pencils.id,
        categoryId: stationary.id,
      },
    }),

    prisma.item.create({
      data: {
        name: "Toor Dal",
        price: 160.0,
        unitType: "KG",
        stock: 80,
        productId: dal.id,
        categoryId: grains.id,
      },
    }),



    prisma.item.create({
      data: {
        name: "Moong Dal",
        price: 140.0,
        unitType: "KG",
        stock: 60,
        productId: dal.id,
        categoryId: grains.id,
      },
    }),
  ]);



  console.log(`✅ Items created: ${items.length} items`);

  // ── Create Customers ──────────────────────────────────────
  const customer1 = await prisma.customer.create({
    data: {
      name: "Rajesh Kumar",
      phone: "9876543210",
      address: "House 12, Main Market",
      balance: 0,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: "Priya Sharma",
      phone: "9876543211",
      address: "Shop 5, Railway Road",
      balance: 0,
    },
  });



  console.log(`✅ Customers created: ${customer1.name}, ${customer2.name}`);

  // ── Summary ───────────────────────────────────────────────
  const counts = {
    admins: await prisma.admin.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    items: await prisma.item.count(),
    customers: await prisma.customer.count(),
  };

  console.log("\n📊 Database summary:");
  Object.entries(counts).forEach(([table, count]) => {
    console.log(`   ${table}: ${count}`);
  });

  console.log("\n🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
