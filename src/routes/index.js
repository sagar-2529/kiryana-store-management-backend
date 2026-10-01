const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const auth = require("../middleware/auth");
const asyncHandler = require("../middleware/async-handler");
const { createPurchase, cancelPurchase, repayCredit, fail } = require("../services/store.service");

const router = express.Router();

// Public onboarding routes. In a real store, remove /register after creating the owner account.
router.post("/auth/register", asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6) fail("Name, email and a password of at least 6 characters are required");
  if (await prisma.admin.count()) fail("An owner account already exists. Please login.", 401);
  const admin = await prisma.admin.create({ data: { name, email, password: await bcrypt.hash(password, 12) }, select: { id: true, name: true, email: true } });
  const token = jwt.sign({ adminId: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
  res.status(201).json({ success: true, data: { admin, token } });
}));
router.post("/auth/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = email && await prisma.admin.findUnique({ where: { email } });
  if (!admin || !password || !await bcrypt.compare(password, admin.password)) fail("Invalid email or password", 401);
  const token = jwt.sign({ adminId: admin.id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
  res.json({ success: true, data: { admin: { id: admin.id, name: admin.name, email: admin.email }, token } });
}));

router.use(auth);
router.get("/auth/me", (req, res) => res.json({ success: true, data: { admin: req.admin } }));
router.put("/auth/change-password", asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
  if (!oldPassword || !newPassword || newPassword.length < 6) fail("A new password of at least 6 characters is required");
  if (!await bcrypt.compare(oldPassword, admin.password)) fail("Current password is incorrect", 401);
  await prisma.admin.update({ where: { id: admin.id }, data: { password: await bcrypt.hash(newPassword, 12) } });
  res.json({ success: true, message: "Password changed" });
}));

router.route("/categories").get(asyncHandler(async (req, res) => res.json({ success: true, data: await prisma.category.findMany({ where: { adminId: req.admin.id }, include: { _count: { select: { products: true, items: true } } }, orderBy: { name: "asc" } }) }))).post(asyncHandler(async (req, res) => {
  if (!req.body.name) fail("Name is required");
  const category = await prisma.category.create({ data: { name: req.body.name, description: req.body.description || null, adminId: req.admin.id } });
  res.status(201).json({ success: true, data: category });
}));
router.route("/categories/:id").get(asyncHandler(async (req, res) => { const data = await prisma.category.findFirst({ where: { id: req.params.id, adminId: req.admin.id }, include: { products: { include: { _count: { select: { items: true } } } } } }); if (!data) fail("Category not found", 404); res.json({ success: true, data }); })).put(asyncHandler(async (req, res) => { const data = await prisma.category.update({ where: { id: req.params.id }, data: { ...(req.body.name !== undefined && { name: req.body.name }), ...(req.body.description !== undefined && { description: req.body.description }) } }); res.json({ success: true, data }); })).delete(asyncHandler(async (req, res) => { const category = await prisma.category.findUnique({ where: { id: req.params.id }, include: { _count: { select: { products: true, items: true } } } }); if (!category || category.adminId !== req.admin.id) fail("Category not found", 404); if (category._count.products || category._count.items) fail("Category has linked products or items", 409); await prisma.category.delete({ where: { id: category.id } }); res.json({ success: true }); }));

router.route("/products").get(asyncHandler(async (req, res) => { const where = { category: { adminId: req.admin.id }, ...(req.query.categoryId && { categoryId: req.query.categoryId }) }; res.json({ success: true, data: await prisma.product.findMany({ where, include: { category: true, _count: { select: { items: true } } }, orderBy: { name: "asc" } }) }); })).post(asyncHandler(async (req, res) => { const { name, description, categoryId } = req.body; if (!name || !categoryId) fail("name and categoryId are required"); const category = await prisma.category.findFirst({ where: { id: categoryId, adminId: req.admin.id } }); if (!category) fail("Category not found", 404); const data = await prisma.product.create({ data: { name, description: description || null, categoryId }, include: { category: true } }); res.status(201).json({ success: true, data }); }));
router.route("/products/:id").get(asyncHandler(async (req, res) => { const data = await prisma.product.findFirst({ where: { id: req.params.id, category: { adminId: req.admin.id } }, include: { category: true, items: true } }); if (!data) fail("Product not found", 404); res.json({ success: true, data }); })).put(asyncHandler(async (req, res) => { const data = await prisma.product.update({ where: { id: req.params.id }, data: { ...(req.body.name !== undefined && { name: req.body.name }), ...(req.body.description !== undefined && { description: req.body.description }) } }); res.json({ success: true, data }); })).delete(asyncHandler(async (req, res) => { const product = await prisma.product.findUnique({ where: { id: req.params.id }, include: { _count: { select: { items: true } }, category: true } }); if (!product || product.category.adminId !== req.admin.id) fail("Product not found", 404); if (product._count.items) fail("Product has linked items", 409); await prisma.product.delete({ where: { id: product.id } }); res.json({ success: true }); }));

router.route("/items").get(asyncHandler(async (req, res) => { const where = { product: { category: { adminId: req.admin.id } }, ...(req.query.categoryId && { categoryId: req.query.categoryId }), ...(req.query.productId && { productId: req.query.productId }), ...(req.query.name && { name: { contains: req.query.name, mode: "insensitive" } }) }; res.json({ success: true, data: await prisma.item.findMany({ where, include: { product: true, category: true }, orderBy: { name: "asc" } }) }); })).post(asyncHandler(async (req, res) => { const { name, price, unitType, stock = 0, productId, categoryId } = req.body; if (!name || price === undefined || !unitType || !productId || !categoryId) fail("name, price, unitType, productId and categoryId are required"); const product = await prisma.product.findFirst({ where: { id: productId, categoryId, category: { adminId: req.admin.id } } }); if (!product) fail("Product/category combination not found", 404); const data = await prisma.item.create({ data: { name, price: Number(price), unitType, stock: Number(stock), productId, categoryId } }); res.status(201).json({ success: true, data }); }));
router.route("/items/:id").get(asyncHandler(async (req, res) => { const data = await prisma.item.findFirst({ where: { id: req.params.id, product: { category: { adminId: req.admin.id } } }, include: { product: true, category: true } }); if (!data) fail("Item not found", 404); res.json({ success: true, data }); })).put(asyncHandler(async (req, res) => { const data = await prisma.item.update({ where: { id: req.params.id }, data: req.body }); res.json({ success: true, data }); })).delete(asyncHandler(async (req, res) => { const item = await prisma.item.findUnique({ where: { id: req.params.id }, include: { product: { include: { category: true } }, _count: { select: { purchases: true } } } }); if (!item || item.product.category.adminId !== req.admin.id) fail("Item not found", 404); if (item._count.purchases) fail("Item has purchase history", 409); await prisma.item.delete({ where: { id: item.id } }); res.json({ success: true }); }));

router.route("/customers").get(asyncHandler(async (req, res) => { const where = { ...(req.query.name && { name: { contains: req.query.name, mode: "insensitive" } }), ...(req.query.hasCredit === "true" && { balance: { gt: 0 } }) }; res.json({ success: true, data: await prisma.customer.findMany({ where, include: { _count: { select: { purchases: true } } }, orderBy: { name: "asc" } }) }); })).post(asyncHandler(async (req, res) => { if (!req.body.name) fail("Name is required"); const data = await prisma.customer.create({ data: { name: req.body.name, phone: req.body.phone || null, address: req.body.address || null } }); res.status(201).json({ success: true, data }); }));
router.route("/customers/:id").get(asyncHandler(async (req, res) => { const data = await prisma.customer.findUnique({ where: { id: req.params.id }, include: { userCredit: true, purchases: { orderBy: { createdAt: "desc" }, take: 10 }, _count: { select: { purchaseItems: true } } } }); if (!data) fail("Customer not found", 404); res.json({ success: true, data }); })).put(asyncHandler(async (req, res) => { const { name, phone, address } = req.body; const data = await prisma.customer.update({ where: { id: req.params.id }, data: { ...(name !== undefined && { name }), ...(phone !== undefined && { phone: phone || null }), ...(address !== undefined && { address: address || null }) } }); res.json({ success: true, data }); })).delete(asyncHandler(async (req, res) => { const customer = await prisma.customer.findUnique({ where: { id: req.params.id }, include: { _count: { select: { purchases: true } } } }); if (!customer) fail("Customer not found", 404); if (Number(customer.balance) > 0 || customer._count.purchases) fail("Customer has outstanding balance or purchase history", 409); await prisma.customer.delete({ where: { id: customer.id } }); res.json({ success: true }); }));
router.get("/customers/:id/purchases", asyncHandler(async (req, res) => { res.json({ success: true, data: await prisma.purchase.findMany({ where: { customerId: req.params.id }, include: { purchaseItems: { include: { item: true } } }, orderBy: { createdAt: "desc" } }) }); }));

router.route("/purchases").get(asyncHandler(async (req, res) => { const where = { ...(req.query.customerId && { customerId: req.query.customerId }), ...(req.query.paymentType && { paymentType: req.query.paymentType }) }; res.json({ success: true, data: await prisma.purchase.findMany({ where, include: { customer: true, _count: { select: { purchaseItems: true } } }, orderBy: { createdAt: "desc" } }) }); })).post(asyncHandler(async (req, res) => { const data = await createPurchase(req.body); res.status(201).json({ success: true, data }); }));
router.get("/purchases/:id", asyncHandler(async (req, res) => { const data = await prisma.purchase.findUnique({ where: { id: req.params.id }, include: { customer: true, purchaseItems: { include: { item: true } }, creditTransaction: true } }); if (!data) fail("Purchase not found", 404); res.json({ success: true, data }); }));
router.post("/purchases/:id/cancel", asyncHandler(async (req, res) => { const result = await cancelPurchase(req.params.id); res.json({ success: true, message: result.alreadyCancelled ? "Purchase was already cancelled" : "Purchase cancelled", data: result.purchase }); }));

router.post("/credits/repay", asyncHandler(async (req, res) => { const data = await repayCredit(req.body); res.status(201).json({ success: true, data }); }));
router.get("/credits/:customerId", asyncHandler(async (req, res) => { const data = await prisma.userCredit.findUnique({ where: { customerId: req.params.customerId }, include: { customer: true, creditTransactions: { orderBy: { createdAt: "desc" }, take: 20 } } }); if (!data) fail("Credit account not found", 404); res.json({ success: true, data }); }));

module.exports = router;
