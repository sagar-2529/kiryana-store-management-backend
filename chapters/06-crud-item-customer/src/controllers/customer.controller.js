// ============================================================
// Controller: Customer — PARTIAL (Homework!)
// ============================================================
// ✅ create  — provided
// ✅ getAll  — provided
// ❌ getById — HOMEWORK
// ❌ update  — HOMEWORK
// ❌ remove  — HOMEWORK
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

// ── GET BY ID ❌ ────────────────────────────────────────────
// HOMEWORK: Implement this!
// Requirements:
//   - Find customer by req.params.id
//   - Include: purchases (recent 10), userCredit, purchaseItems count
//   - Return 404 if not found
//
const getById = async (req, res) => {
  // 👇 YOUR CODE HERE
  sendError(res, 501, "Not implemented yet — this is your homework!");
};

// ── UPDATE ❌ ───────────────────────────────────────────────
// HOMEWORK: Implement this!
// Requirements:
//   - Update name, phone, and/or address
//   - Handle P2025 (not found) and P2002 (duplicate phone)
//   - Do NOT allow updating 'balance' directly (that happens via purchases)
//
const update = async (req, res) => {
  // 👇 YOUR CODE HERE
  sendError(res, 501, "Not implemented yet — this is your homework!");
};

// ── DELETE ❌ ───────────────────────────────────────────────
// HOMEWORK: Implement this!
// Requirements:
//   - Check if customer.balance > 0 → reject with 400
//   - Check if customer has purchases → warn or reject
//   - Handle not found
//
const remove = async (req, res) => {
  // 👇 YOUR CODE HERE
  sendError(res, 501, "Not implemented yet — this is your homework!");
};

// ── GET CUSTOMER PURCHASES ❌ ───────────────────────────────
// BONUS HOMEWORK:
// GET /api/v1/customers/:id/purchases
// Return all purchases for this customer with purchaseItems included
//
const getPurchases = async (req, res) => {
  // 👇 YOUR CODE HERE
  sendError(res, 501, "Not implemented yet — this is your homework!");
};

module.exports = { create, getAll, getById, update, remove, getPurchases };
