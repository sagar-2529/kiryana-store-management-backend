// ============================================================
// Routes: Category — NOW WITH VALIDATION MIDDLEWARE! 🎉
// Notice: validate(schema) sits between route and controller
// ============================================================

const express = require("express");
const router = express.Router();
const c = require("../controllers/category.controller");
const { validate, validateParams } = require("../middleware/validate");
const { createCategorySchema, updateCategorySchema, idParamSchema } = require("../validations/schemas");

// POST   /api/v1/categories — validate body before creating
router.post("/", validate(createCategorySchema), c.create);

// GET    /api/v1/categories — no body to validate
router.get("/", c.getAll);

// GET    /api/v1/categories/:id — validate UUID param
router.get("/:id", validateParams(idParamSchema), c.getById);

// PUT    /api/v1/categories/:id — validate both param and body
router.put("/:id", validateParams(idParamSchema), validate(updateCategorySchema), c.update);

// DELETE /api/v1/categories/:id — validate param
router.delete("/:id", validateParams(idParamSchema), c.remove);

module.exports = router;
