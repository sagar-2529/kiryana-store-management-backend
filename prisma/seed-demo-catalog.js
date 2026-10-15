require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to seed the demo catalogue.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Each product also receives one stock item (SKU). This makes the catalogue
// immediately usable from both the Inventory and Billing screens.
const catalogue = [
  {
    name: "Dairy",
    description: "Milk, curd, butter, paneer and ghee",
    products: [
      ["Amul Taaza Milk 1L", 68, "PACKET", 40], ["Amul Masti Curd 400g", 45, "PACKET", 35],
      ["Amul Butter 100g", 60, "PACKET", 25], ["Amul Paneer 200g", 95, "PACKET", 20],
      ["Amul Cow Ghee 500ml", 340, "BOTTLE", 15],
    ],
  },
  {
    name: "Staples & Grains", description: "Rice, flour and kitchen staples",
    products: [["India Gate Basmati Rice 5kg", 650, "PACKET", 18], ["Aashirvaad Atta 5kg", 295, "PACKET", 20], ["Tata Salt 1kg", 28, "PACKET", 45], ["Fortune Besan 1kg", 115, "PACKET", 25], ["Sooji 1kg", 62, "PACKET", 30]],
  },
  {
    name: "Pulses & Lentils", description: "Dal, chana and pulses",
    products: [["Toor Dal 1kg", 185, "PACKET", 25], ["Masoor Dal 1kg", 145, "PACKET", 25], ["Moong Dal 1kg", 170, "PACKET", 20], ["Kabuli Chana 1kg", 155, "PACKET", 20], ["Rajma 1kg", 180, "PACKET", 18]],
  },
  {
    name: "Cooking Oils & Ghee", description: "Edible oils and cooking fats",
    products: [["Fortune Sunflower Oil 1L", 145, "BOTTLE", 30], ["Fortune Mustard Oil 1L", 170, "BOTTLE", 24], ["Saffola Gold Oil 1L", 185, "BOTTLE", 20], ["Dhara Groundnut Oil 1L", 205, "BOTTLE", 15], ["Vanaspati Ghee 1L", 175, "PACKET", 15]],
  },
  {
    name: "Spices & Masalas", description: "Whole spices and spice mixes",
    products: [["Everest Turmeric Powder 200g", 52, "PACKET", 30], ["MDH Red Chilli Powder 100g", 58, "PACKET", 28], ["Tata Sampann Garam Masala 100g", 75, "PACKET", 25], ["Catch Cumin Powder 100g", 72, "PACKET", 20], ["Everest Chaat Masala 100g", 65, "PACKET", 20]],
  },
  {
    name: "Biscuits & Bakery", description: "Biscuits, cookies and baked snacks",
    products: [["Parle-G Gold 250g", 35, "PACKET", 50], ["Britannia Good Day 200g", 40, "PACKET", 40], ["Marie Gold 250g", 38, "PACKET", 35], ["Hide & Seek 120g", 35, "PACKET", 30], ["Britannia Fruit Cake 60g", 15, "PIECE", 40]],
  },
  {
    name: "Snacks & Namkeen", description: "Chips, namkeen and savoury snacks",
    products: [["Lays Classic Salted 52g", 20, "PACKET", 45], ["Kurkure Masala Munch 90g", 20, "PACKET", 45], ["Haldiram Aloo Bhujia 200g", 62, "PACKET", 30], ["Bikaji Bikaneri Bhujia 200g", 58, "PACKET", 30], ["Too Yumm Multigrain Chips 55g", 20, "PACKET", 30]],
  },
  {
    name: "Beverages", description: "Cold drinks, juices and packaged water",
    products: [["Coca-Cola 750ml", 40, "BOTTLE", 35], ["Pepsi 750ml", 40, "BOTTLE", 35], ["Tropicana Orange Juice 1L", 125, "PACKET", 20], ["Bisleri Water 1L", 20, "BOTTLE", 50], ["Red Bull Energy Drink 250ml", 125, "BOTTLE", 15]],
  },
  {
    name: "Tea & Coffee", description: "Tea leaves, instant coffee and premix",
    products: [["Tata Tea Premium 500g", 280, "PACKET", 25], ["Red Label Tea 500g", 295, "PACKET", 20], ["Nescafe Classic Coffee 50g", 165, "BOTTLE", 18], ["Bru Instant Coffee 50g", 130, "BOTTLE", 18], ["Taj Mahal Tea 250g", 180, "PACKET", 20]],
  },
  {
    name: "Breakfast & Cereals", description: "Oats, cereal and breakfast mixes",
    products: [["Kellogg's Corn Flakes 475g", 210, "BOX", 15], ["Quaker Oats 1kg", 220, "PACKET", 20], ["Maggie Oats Masala 40g", 25, "PACKET", 30], ["Saffola Masala Oats 39g", 25, "PACKET", 30], ["Muesli Fruit & Nut 400g", 285, "PACKET", 12]],
  },
  {
    name: "Instant Foods", description: "Noodles, pasta and ready-to-cook meals",
    products: [["Maggi 2-Minute Noodles 70g", 15, "PACKET", 60], ["Yippee Magic Masala 70g", 15, "PACKET", 50], ["Top Ramen Curry Noodles 70g", 15, "PACKET", 35], ["MTR Upma Mix 160g", 65, "PACKET", 20], ["Knorr Tomato Soup 45g", 45, "PACKET", 25]],
  },
  {
    name: "Personal Care", description: "Bath, oral and hair care",
    products: [["Lux Soap 100g", 38, "PIECE", 40], ["Dove Soap 100g", 58, "PIECE", 30], ["Colgate Toothpaste 200g", 115, "PACKET", 25], ["Clinic Plus Shampoo 340ml", 210, "BOTTLE", 20], ["Closeup Toothpaste 150g", 95, "PACKET", 25]],
  },
  {
    name: "Home Cleaning", description: "Household cleaning supplies",
    products: [["Lizol Floor Cleaner 500ml", 105, "BOTTLE", 20], ["Harpic Toilet Cleaner 500ml", 110, "BOTTLE", 20], ["Colin Glass Cleaner 500ml", 115, "BOTTLE", 18], ["Dettol Antiseptic Liquid 500ml", 185, "BOTTLE", 15], ["Mortein Mosquito Refill", 85, "PACKET", 25]],
  },
  {
    name: "Laundry & Dishwash", description: "Detergent and dishwashing products",
    products: [["Surf Excel Easy Wash 1kg", 130, "PACKET", 25], ["Tide Plus 1kg", 115, "PACKET", 25], ["Ariel Matic 1kg", 225, "PACKET", 18], ["Vim Dishwash Bar 300g", 35, "PACKET", 35], ["Vim Liquid 500ml", 110, "BOTTLE", 20]],
  },
  {
    name: "Baby Care", description: "Diapers, wipes and baby hygiene",
    products: [["Pampers Diapers Medium 20", 460, "PACKET", 12], ["Huggies Dry Pants Large 16", 390, "PACKET", 12], ["Johnson's Baby Soap 75g", 65, "PIECE", 20], ["Johnson's Baby Oil 100ml", 145, "BOTTLE", 18], ["Baby Wipes Pack 72", 190, "PACKET", 15]],
  },
  {
    name: "Stationery", description: "Everyday school and office supplies",
    products: [["Classmate Notebook 172 Pages", 85, "PIECE", 30], ["Cello Butterflow Pen Blue", 10, "PIECE", 100], ["Nataraj Pencil Pack 10", 50, "BOX", 25], ["Apsara Eraser Pack 5", 25, "PACKET", 30], ["Fevicol MR 100g", 45, "BOTTLE", 20]],
  },
];

async function main() {
  const admin = await prisma.admin.findFirst({ orderBy: { createdAt: "asc" } });
  if (!admin) {
    throw new Error("Create your owner account first, then run this catalogue seed.");
  }

  let createdCategories = 0;
  let createdProducts = 0;
  let createdItems = 0;

  for (const categoryData of catalogue) {
    let category = await prisma.category.findUnique({ where: { name: categoryData.name } });
    if (!category) {
      category = await prisma.category.create({
        data: { name: categoryData.name, description: categoryData.description, adminId: admin.id },
      });
      createdCategories += 1;
    }

    for (const [name, price, unitType, stock] of categoryData.products) {
      let product = await prisma.product.findFirst({ where: { name, categoryId: category.id } });
      if (!product) {
        product = await prisma.product.create({
          data: { name, description: `${name} - demo catalogue item`, categoryId: category.id },
        });
        createdProducts += 1;
      }

      const item = await prisma.item.findFirst({ where: { name, productId: product.id } });
      if (!item) {
        await prisma.item.create({
          data: { name, price, unitType, stock, productId: product.id, categoryId: category.id },
        });
        createdItems += 1;
      }
    }
  }

  const [categoryCount, productCount, itemCount] = await Promise.all([
    prisma.category.count(), prisma.product.count(), prisma.item.count(),
  ]);
  console.log(`Demo catalogue ready. Added ${createdCategories} categories, ${createdProducts} products and ${createdItems} stock items.`);
  console.log(`Current totals: ${categoryCount} categories, ${productCount} products, ${itemCount} stock items.`);
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
