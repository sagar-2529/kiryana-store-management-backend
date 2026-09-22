// ============================================================
// Controller: Customer
// ============================================================
// ✅ create  — provided
// ✅ getAll  — provided
// ✅ getById, update, remove, getPurchases
// ============================================================

const prisma = require("../lib/prisma");
const { sendSuccess, sendError } = require("../utils/response");

// ── CREATE ✅ ───────────────────────────────────────────────
const create = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    if (!name) return sendError(res, 400, "Field 'name' is required");

    const customer = await prisma.customer.create({
      data: {
        name,
        phone: phone || null,
        address: address || null,
        balance: 0,
      },
    });

    sendSuccess(res, 201, customer, "Customer created");
  } catch (error) {
    if (error.code === "P2002") {
      return sendError(res, 409, `Phone number '${req.body.phone}' already registered`);
    }
    console.error(error);
    sendError(res, 500, "Failed to create customer");
  }
};

// ── GET ALL ✅ ──────────────────────────────────────────────
const getAll = async (req, res) => {
  try {
    const where = {};

    // Search by name: /api/v1/customers?name=rajesh
    if (req.query.name) {
      where.name = { contains: req.query.name, mode: "insensitive" };
    }

    // Filter by balance: /api/v1/customers?hasCredit=true
    if (req.query.hasCredit === "true") {
      where.balance = { gt: 0 };
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        _count: { select: { purchases: true } },
      },
      orderBy: { name: "asc" },
    });

    sendSuccess(res, 200, customers);
  } catch (error) {
    console.error(error);
    sendError(res, 500, "Failed to fetch customers");
  }
};

// ── GET BY ID ──────────────────────────────────────────────
// Requirements:
//   - Find customer by req.params.id
//   - Include: purchases (recent 10), userCredit, purchaseItems count
//   - Return 404 if not found
//
const getById = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        purchases: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { _count: { select: { purchaseItems: true } } },
        },
        userCredit: true,
        _count: { select: { purchaseItems: true } },
      },
    });

    if (!customer) return sendError(res, 404, "Customer not found");
    return sendSuccess(res, 200, customer);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Failed to fetch customer");
  }
};

// ── UPDATE ─────────────────────────────────────────────────
// Requirements:
//   - Update name, phone, and/or address
//   - Handle P2025 (not found) and P2002 (duplicate phone)
//   - Do NOT allow updating 'balance' directly (that happens via purchases)
//
const update = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone || null;
    if (address !== undefined) data.address = address || null;

    if (Object.keys(data).length === 0) {
      return sendError(res, 400, "Provide at least one of: name, phone, address");
    }

    const customer = await prisma.customer.update({
      where: { id: req.params.id },
      data,
    });
    return sendSuccess(res, 200, customer, "Customer updated");
  } catch (error) {
    if (error.code === "P2025") return sendError(res, 404, "Customer not found");
    if (error.code === "P2002") return sendError(res, 409, "Phone number already registered");
    console.error(error);
    return sendError(res, 500, "Failed to update customer");
  }
};

// ── DELETE ─────────────────────────────────────────────────
// Requirements:
//   - Check if customer.balance > 0 → reject with 400
//   - Check if customer has purchases → warn or reject
//   - Handle not found
//
const remove = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { purchases: true } } },
    });
    if (!customer) return sendError(res, 404, "Customer not found");
    if (Number(customer.balance) > 0) {
      return sendError(res, 400, "Customer has an outstanding credit balance and cannot be deleted");
    }
    if (customer._count.purchases > 0) {
      return sendError(res, 400, "Customer has purchase history and cannot be deleted");
    }

    await prisma.customer.delete({ where: { id: customer.id } });
    return sendSuccess(res, 200, undefined, "Customer deleted");
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Failed to delete customer");
  }
};

// ── GET CUSTOMER PURCHASES ─────────────────────────────────
// GET /api/v1/customers/:id/purchases
// Return all purchases for this customer with purchaseItems included
//
const getPurchases = async (req, res) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!customer) return sendError(res, 404, "Customer not found");

    const purchases = await prisma.purchase.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
      include: { purchaseItems: { include: { item: { select: { name: true, unitType: true } } } } },
    });
    return sendSuccess(res, 200, purchases);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, "Failed to fetch customer purchases");
  }
};

module.exports = { create, getAll, getById, update, remove, getPurchases };
