// ============================================================
// Routes: Admin
// ============================================================

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

// GET /api/v1/admin/profile
router.get("/profile", adminController.getProfile);

module.exports = router;
