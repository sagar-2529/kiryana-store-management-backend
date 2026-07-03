const express = require("express");
const router = express.Router();
const c = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth");

// Public routes (no auth required)
router.post("/register", c.register);
router.post("/login", c.login);

// Protected routes (auth required)
router.get("/me", authMiddleware, c.getMe);
router.put("/change-password", authMiddleware, c.changePassword);

module.exports = router;
