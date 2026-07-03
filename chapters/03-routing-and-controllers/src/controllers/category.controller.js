// ============================================================
// Controller: Category
// In-memory CRUD — will be replaced by Prisma in Chapter 05
// ============================================================

const { sendSuccess, sendError } = require("../utils/response");

// ── In-Memory Store ─────────────────────────────────────────
let categories = [
  { id: 1, name: "Dairy", description: "Milk, butter, paneer, curd" },
  { id: 2, name: "Grains & Pulses", description: "Rice, wheat, dal, flour" },
  { id: 3, name: "Spices", description: "Turmeric, chilli, cumin, coriander" },
];
let nextId = 4;

// ── Handlers ────────────────────────────────────────────────

const getAll = (req, res) => {
  sendSuccess(res, 200, categories);
};

const getById = (req, res) => {
  const id = parseInt(req.params.id);
  const category = categories.find((c) => c.id === id);

  if (!category) {
    return sendError(res, 404, `Category with id ${id} not found`);
  }

  sendSuccess(res, 200, category);
};

const create = (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return sendError(res, 400, "Field 'name' is required");
  }

  // Check for duplicate name
  if (categories.find((c) => c.name.toLowerCase() === name.toLowerCase())) {
    return sendError(res, 409, `Category '${name}' already exists`);
  }

  const newCategory = {
    id: nextId++,
    name,
    description: description || null,
  };

  categories.push(newCategory);
  sendSuccess(res, 201, newCategory, "Category created successfully");
};

const update = (req, res) => {
  const id = parseInt(req.params.id);
  const index = categories.findIndex((c) => c.id === id);

  if (index === -1) {
    return sendError(res, 404, `Category with id ${id} not found`);
  }

  const { name, description } = req.body;

  // Update only provided fields
  if (name !== undefined) categories[index].name = name;
  if (description !== undefined) categories[index].description = description;

  sendSuccess(res, 200, categories[index], "Category updated successfully");
};

const remove = (req, res) => {
  const id = parseInt(req.params.id);
  const index = categories.findIndex((c) => c.id === id);

  if (index === -1) {
    return sendError(res, 404, `Category with id ${id} not found`);
  }

  categories.splice(index, 1);
  sendSuccess(res, 200, null, "Category deleted successfully");
};

module.exports = { getAll, getById, create, update, remove };
