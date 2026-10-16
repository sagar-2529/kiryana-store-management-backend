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

// Five additional products for each original category. Together with the
// entries above, this gives each standard category a realistic 10-item shelf.
const categoryAdditions = {
  "Dairy": [["Mother Dairy Toned Milk 1L", 66, "PACKET", 35], ["Amul Cheese Slices 200g", 145, "PACKET", 18], ["Nestle Milkmaid 400g", 135, "PACKET", 16], ["Amul Lassi 200ml", 30, "BOTTLE", 30], ["Yakult Probiotic Drink 65ml", 85, "PACKET", 12]],
  "Staples & Grains": [["Fortune Chakki Fresh Atta 5kg", 310, "PACKET", 18], ["Daawat Rozana Basmati Rice 5kg", 480, "PACKET", 16], ["Tata Sampann Poha 1kg", 75, "PACKET", 22], ["Fortune Sugar 1kg", 48, "PACKET", 45], ["Organic Jaggery 500g", 65, "PACKET", 20]],
  "Pulses & Lentils": [["Chana Dal 1kg", 120, "PACKET", 24], ["Urad Dal 1kg", 175, "PACKET", 20], ["Moong Whole 1kg", 145, "PACKET", 18], ["Lobia 1kg", 140, "PACKET", 16], ["Soya Chunks 1kg", 125, "PACKET", 18]],
  "Cooking Oils & Ghee": [["Fortune Rice Bran Oil 1L", 155, "BOTTLE", 20], ["Sundrop Heart Oil 1L", 180, "BOTTLE", 18], ["Nature Fresh Refined Oil 1L", 145, "BOTTLE", 20], ["Amul Pure Ghee 1L", 695, "BOTTLE", 10], ["Coconut Oil 500ml", 145, "BOTTLE", 18]],
  "Spices & Masalas": [["Everest Coriander Powder 100g", 40, "PACKET", 26], ["MDH Kitchen King Masala 100g", 72, "PACKET", 20], ["Tata Sampann Cumin Seeds 100g", 65, "PACKET", 22], ["Catch Black Pepper 50g", 90, "PACKET", 16], ["Everest Pav Bhaji Masala 100g", 58, "PACKET", 20]],
  "Biscuits & Bakery": [["Parle Monaco 200g", 30, "PACKET", 42], ["Britannia Bourbon 150g", 35, "PACKET", 35], ["Sunfeast Dark Fantasy 75g", 45, "PACKET", 25], ["Unibic Choco Chip Cookies 150g", 55, "PACKET", 24], ["Britannia Milk Bread 400g", 45, "PACKET", 20]],
  "Snacks & Namkeen": [["Haldiram Bhujia Sev 200g", 60, "PACKET", 30], ["Balaji Wafers 150g", 40, "PACKET", 32], ["Bingo Mad Angles 72g", 20, "PACKET", 40], ["Too Yumm Karare 60g", 20, "PACKET", 35], ["Cornitos Nacho Chips 150g", 75, "PACKET", 18]],
  "Beverages": [["Sprite 750ml", 40, "BOTTLE", 30], ["Thums Up 750ml", 40, "BOTTLE", 30], ["Real Mixed Fruit Juice 1L", 125, "PACKET", 18], ["Paper Boat Aam Panna 250ml", 35, "PACKET", 24], ["Sting Energy Drink 250ml", 50, "BOTTLE", 24]],
  "Tea & Coffee": [["Tata Tea Gold 500g", 310, "PACKET", 18], ["Brooke Bond Red Label 250g", 150, "PACKET", 22], ["Nescafe Sunrise 100g", 110, "PACKET", 20], ["Bru Gold Coffee 100g", 235, "BOTTLE", 15], ["Continental Xtra Coffee 100g", 160, "BOTTLE", 15]],
  "Breakfast & Cereals": [["Kellogg's Chocos 375g", 210, "BOX", 15], ["Bagrry's Muesli 500g", 320, "PACKET", 12], ["Saffola Oats 1kg", 210, "PACKET", 18], ["Pillsbury Pancake Mix 200g", 95, "PACKET", 18], ["NutriChoice Digestive 400g", 75, "PACKET", 24]],
  "Instant Foods": [["Maggi Masala Oats 39g", 25, "PACKET", 30], ["Knorr Sweet Corn Soup 45g", 45, "PACKET", 20], ["Ching's Secret Schezwan Noodles", 35, "PACKET", 24], ["Bambino Macaroni 400g", 70, "PACKET", 18], ["MTR Poha Mix 160g", 65, "PACKET", 18]],
  "Personal Care": [["Pears Soap 125g", 55, "PIECE", 28], ["Sunsilk Shampoo 180ml", 115, "BOTTLE", 20], ["Head & Shoulders 180ml", 145, "BOTTLE", 18], ["Dettol Soap 125g", 42, "PIECE", 30], ["Vaseline Body Lotion 200ml", 165, "BOTTLE", 16]],
  "Home Cleaning": [["Klinex Toilet Cleaner 500ml", 100, "BOTTLE", 18], ["Good Knight Gold Refill", 85, "PACKET", 20], ["Odonil Room Freshener 75g", 55, "PACKET", 22], ["Scotch-Brite Scrub Pad Pack", 55, "PACKET", 24], ["Pril Dishwash Liquid 425ml", 110, "BOTTLE", 18]],
  "Laundry & Dishwash": [["Rin Detergent Bar 250g", 28, "PIECE", 35], ["Wheel Detergent Powder 1kg", 70, "PACKET", 28], ["Comfort Fabric Conditioner 220ml", 75, "BOTTLE", 18], ["Exo Dishwash Bar 300g", 35, "PACKET", 25], ["Finish Dishwash Tablets Pack", 220, "PACKET", 10]],
  "Baby Care": [["Pampers Baby Wipes 72", 180, "PACKET", 18], ["Himalaya Baby Shampoo 200ml", 160, "BOTTLE", 15], ["Johnson's Baby Powder 100g", 115, "PACKET", 16], ["Mee Mee Feeding Bottle 250ml", 160, "PIECE", 12], ["Cerelac Wheat Apple 300g", 260, "PACKET", 14]],
  "Stationery": [["Camlin Geometry Box", 110, "BOX", 20], ["Cello Gel Pen Pack 5", 50, "PACKET", 30], ["Classmate Drawing Book", 60, "PIECE", 25], ["Apsara Sharpener Pack 10", 35, "PACKET", 28], ["Fevistik Glue Stick 22g", 35, "PIECE", 20]],
};

const additionalCatalogue = [
  { name: "Fruits & Vegetables", description: "Daily fresh produce", products: [["Potato 1kg", 35, "KG", 50], ["Onion 1kg", 45, "KG", 45], ["Tomato 1kg", 40, "KG", 35], ["Banana Pack 6", 45, "PACKET", 25], ["Apple Royal Gala 1kg", 180, "KG", 18], ["Lemon 500g", 35, "PACKET", 20], ["Ginger 250g", 30, "PACKET", 20], ["Garlic 250g", 45, "PACKET", 20], ["Coriander Bunch", 15, "PIECE", 30], ["Spinach Bunch", 20, "PIECE", 25]] },
  { name: "Frozen Foods", description: "Frozen snacks and ready meals", products: [["McCain French Fries 750g", 150, "PACKET", 15], ["McCain Aloo Tikki 400g", 130, "PACKET", 15], ["ITC Master Chef Green Peas 500g", 95, "PACKET", 18], ["Safal Mixed Vegetables 1kg", 150, "PACKET", 12], ["Yummiez Veg Nuggets 500g", 210, "PACKET", 12], ["Amul Frozen Paneer 200g", 100, "PACKET", 16], ["Frozen Sweet Corn 500g", 90, "PACKET", 18], ["Mother Dairy Ice Cream Vanilla 700ml", 220, "BOX", 10], ["Vadilal Kulfi Pack 6", 180, "BOX", 10], ["Frozen Paratha Pack 5", 120, "PACKET", 15]] },
  { name: "Health & Nutrition", description: "Nutrition drinks and wellness products", products: [["Bournvita 500g", 240, "PACKET", 18], ["Horlicks Classic 500g", 285, "PACKET", 16], ["Complan Chocolate 500g", 320, "PACKET", 14], ["Ensure Vanilla 400g", 850, "PACKET", 8], ["Protinex Original 400g", 390, "PACKET", 12], ["Glucon-D Orange 1kg", 180, "PACKET", 16], ["ORS Lemon Sachet", 22, "PACKET", 40], ["Chyawanprash 500g", 190, "PACKET", 14], ["Honey 500g", 220, "BOTTLE", 15], ["Isabgol 100g", 125, "PACKET", 18]] },
  { name: "Confectionery", description: "Chocolates, candy and treats", products: [["Cadbury Dairy Milk 52g", 45, "PIECE", 50], ["KitKat 4 Finger", 35, "PIECE", 45], ["Nestle Munch 32g", 20, "PIECE", 50], ["Ferrero Rocher Pack 16", 850, "BOX", 8], ["Alpenliebe Candy Pack", 50, "PACKET", 30], ["Center Fresh Gum Pack", 20, "PACKET", 40], ["Pulse Candy Pack", 40, "PACKET", 32], ["Lotte Choco Pie Pack", 120, "PACKET", 20], ["Happydent White Pack", 25, "PACKET", 30], ["Cadbury Gems 28g", 20, "PACKET", 35]] },
  { name: "Dry Fruits & Nuts", description: "Nuts, seeds and dried fruit", products: [["California Almonds 250g", 260, "PACKET", 18], ["Cashew Nuts 250g", 280, "PACKET", 18], ["Raisins 250g", 110, "PACKET", 20], ["Pistachios 200g", 320, "PACKET", 14], ["Walnuts 200g", 280, "PACKET", 14], ["Dates 500g", 190, "PACKET", 18], ["Roasted Peanuts 200g", 60, "PACKET", 28], ["Pumpkin Seeds 100g", 120, "PACKET", 18], ["Sunflower Seeds 100g", 85, "PACKET", 20], ["Trail Mix 200g", 190, "PACKET", 16]] },
  { name: "Sauces, Pickles & Spreads", description: "Condiments and spreads", products: [["Kissan Tomato Ketchup 500g", 105, "BOTTLE", 20], ["Maggi Hot & Sweet Sauce 500g", 130, "BOTTLE", 18], ["Veeba Mayonnaise 300g", 125, "BOTTLE", 18], ["Dr. Oetker Pizza Sauce 300g", 115, "BOTTLE", 16], ["Mother's Recipe Mango Pickle 500g", 150, "PACKET", 15], ["Kissan Mixed Fruit Jam 500g", 150, "BOTTLE", 15], ["Sundrop Peanut Butter 500g", 220, "BOTTLE", 14], ["Mapro Strawberry Crush 750ml", 190, "BOTTLE", 12], ["Ching's Schezwan Chutney 250g", 95, "BOTTLE", 18], ["Tops Vinegar 700ml", 55, "BOTTLE", 20]] },
  { name: "Pet Care", description: "Food and care for pets", products: [["Pedigree Adult Chicken 1.2kg", 330, "PACKET", 12], ["Drools Adult Dog Food 1.2kg", 290, "PACKET", 12], ["Whiskas Ocean Fish 1.2kg", 390, "PACKET", 10], ["Me-O Cat Food 400g", 190, "PACKET", 14], ["Dog Treat Biscuits 500g", 150, "PACKET", 16], ["Pet Shampoo 200ml", 180, "BOTTLE", 12], ["Pet Feeding Bowl", 120, "PIECE", 15], ["Cat Litter 5kg", 450, "PACKET", 8], ["Pet Collar Medium", 140, "PIECE", 14], ["Pet Poop Bags Pack", 110, "PACKET", 15]] },
  { name: "Kitchen Essentials", description: "Cooking tools and kitchen supplies", products: [["Aluminium Foil 9m", 95, "PACKET", 20], ["Cling Film 30m", 110, "PACKET", 18], ["Ziploc Storage Bags Pack", 145, "PACKET", 16], ["Garbage Bags Large Pack", 140, "PACKET", 20], ["Paper Napkins Pack 100", 70, "PACKET", 24], ["Toothpicks Pack 100", 25, "PACKET", 30], ["Gas Lighter", 130, "PIECE", 16], ["Steel Scrubber Pack 3", 40, "PACKET", 25], ["Kitchen Sponge Pack 3", 45, "PACKET", 25], ["Matchbox Pack 10", 30, "PACKET", 30]] },
  { name: "Pooja & Religious", description: "Everyday worship essentials", products: [["Agarbatti Sandal 100 Sticks", 65, "PACKET", 25], ["Camphor Tablets 100g", 80, "PACKET", 20], ["Cotton Wicks 100g", 45, "PACKET", 25], ["Pooja Oil 500ml", 110, "BOTTLE", 18], ["Kumkum Pack 25g", 30, "PACKET", 30], ["Roli Chawal Pack", 25, "PACKET", 30], ["Dhoop Cones Pack", 55, "PACKET", 20], ["Brass Diya Small", 120, "PIECE", 15], ["Pooja Thali Steel", 250, "PIECE", 10], ["Gangajal Bottle 250ml", 45, "BOTTLE", 20]] },
  { name: "Disposable & Packaging", description: "Party and food packaging supplies", products: [["Paper Cups Pack 50", 70, "PACKET", 25], ["Plastic Cups Pack 50", 85, "PACKET", 25], ["Paper Plates Pack 50", 100, "PACKET", 22], ["Areca Plates Pack 25", 140, "PACKET", 18], ["Aluminium Containers Pack 10", 90, "PACKET", 20], ["Carry Bags Medium Pack", 120, "PACKET", 18], ["Tissue Roll Pack 4", 140, "PACKET", 16], ["Drinking Straws Pack 100", 45, "PACKET", 24], ["Wooden Spoons Pack 50", 65, "PACKET", 22], ["Birthday Candles Pack", 40, "PACKET", 20]] },
  { name: "Seasonal & Festive", description: "Gift packs and festival essentials", products: [["Rangoli Colours Pack", 120, "PACKET", 18], ["Decorative Diyas Pack 4", 150, "BOX", 15], ["LED Fairy Lights 5m", 220, "PIECE", 12], ["Gift Wrap Roll", 70, "PIECE", 20], ["Greeting Card Pack", 100, "PACKET", 18], ["Raksha Bandhan Rakhi Set", 150, "PACKET", 15], ["Holi Colours Pack", 120, "PACKET", 18], ["Festival Dry Fruit Box", 650, "BOX", 10], ["Sparklers Pack", 90, "PACKET", 20], ["Decorative Toran", 180, "PIECE", 14]] },
  { name: "Beauty & Cosmetics", description: "Daily beauty and grooming products", products: [["Pond's Face Wash 100g", 180, "PACKET", 18], ["Lakme Kajal", 180, "PIECE", 20], ["Nivea Creme 100ml", 175, "BOTTLE", 18], ["Garnier Face Wash 100g", 160, "PACKET", 18], ["Wild Stone Deodorant 150ml", 220, "BOTTLE", 16], ["Set Wet Hair Gel 100ml", 95, "BOTTLE", 18], ["Colgate Toothbrush Pack 2", 70, "PACKET", 24], ["Gillette Shaving Foam 196g", 210, "BOTTLE", 14], ["Veet Hair Removal Cream 100g", 160, "PACKET", 16], ["Biotique Shampoo 180ml", 170, "BOTTLE", 16]] },
  { name: "Paper & Hygiene", description: "Paper goods and personal hygiene", products: [["Whisper Ultra Pads XL 15", 160, "PACKET", 18], ["Stayfree Secure Pads XL 20", 180, "PACKET", 18], ["Sofy Bodyfit Pads XL 16", 165, "PACKET", 18], ["Toilet Paper Roll Pack 4", 140, "PACKET", 16], ["Facial Tissue Box", 90, "BOX", 20], ["Hand Sanitizer 500ml", 160, "BOTTLE", 18], ["Dettol Handwash 200ml", 75, "BOTTLE", 22], ["Savlon Handwash 200ml", 70, "BOTTLE", 22], ["Wet Wipes Pack 30", 85, "PACKET", 20], ["Adult Diapers Pack 10", 420, "PACKET", 10]] },
  { name: "First Aid & Wellness", description: "Basic first aid and daily wellness", products: [["Band Aid Strips Pack", 45, "PACKET", 30], ["Dettol Antiseptic 125ml", 55, "BOTTLE", 24], ["Savlon Antiseptic 100ml", 50, "BOTTLE", 24], ["Vicks Vaporub 50g", 95, "PACKET", 20], ["Volini Spray 40g", 170, "BOTTLE", 15], ["Digital Thermometer", 180, "PIECE", 15], ["N95 Mask Pack 5", 125, "PACKET", 20], ["Hot Water Bag", 160, "PIECE", 14], ["Electrolyte Powder 200g", 125, "PACKET", 18], ["Vitamin C Tablets Pack", 180, "PACKET", 15]] },
];

async function main() {
  const admin = await prisma.admin.findFirst({ orderBy: { createdAt: "asc" } });
  if (!admin) {
    throw new Error("Create your owner account first, then run this catalogue seed.");
  }

  let createdCategories = 0;
  let createdProducts = 0;
  let createdItems = 0;

  const fullCatalogue = [
    ...catalogue.map((category) => ({
      ...category,
      products: [...category.products, ...(categoryAdditions[category.name] || [])],
    })),
    ...additionalCatalogue,
  ];

  for (const categoryData of fullCatalogue) {
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
