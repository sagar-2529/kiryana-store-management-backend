// ============================================================
// Routes: Category
// ============================================================

const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");

// POST   /api/v1/categories       → create
// GET    /api/v1/categories       → list all
// GET    /api/v1/categories/:id   → get one
// PUT    /api/v1/categories/:id   → update
// DELETE /api/v1/categories/:id   → delete

router.post("/", categoryController.create);
router.get("/", categoryController.getAll);
router.get("/:id", categoryController.getById);
router.put("/:id", categoryController.update);
router.delete("/:id", categoryController.remove);

module.exports = router;
