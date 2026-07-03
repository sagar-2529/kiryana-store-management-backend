// ============================================================
// Controller: Auth — Register, Login
// ============================================================

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const asyncHandler = require("../middleware/asyncHandler");
const { ValidationError, UnauthorizedError } = require("../utils/errors");

const JWT_SECRET = process.env.JWT_SECRET || "kiryana-super-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Generate JWT for an admin
 */
function generateToken(admin) {
  return jwt.sign(
    { adminId: admin.id, email: admin.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ── REGISTER ────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new ValidationError("Fields name, email, password are required");
  }

  if (password.length < 6) {
    throw new ValidationError("Password must be at least 6 characters");
  }

  // Check if email already registered
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    throw new ValidationError("Email already registered");
  }

  // Hash password (12 salt rounds = good balance of security and speed)
  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const token = generateToken(admin);

  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    data: { admin, token },
  });
});

// ── LOGIN ───────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError("Email and password are required");
  }

  // Find admin by email
  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // Compare password with hash
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const token = generateToken(admin);

  res.json({
    success: true,
    message: "Login successful",
    data: {
      admin: { id: admin.id, name: admin.name, email: admin.email },
      token,
    },
  });
});

// ── GET ME (homework stub) ──────────────────────────────────
// HOMEWORK: Implement — return req.admin (already attached by auth middleware)
const getMe = asyncHandler(async (req, res) => {
  // 👇 YOUR CODE HERE (hint: req.admin is already available!)
  res.status(501).json({ success: false, error: "Not implemented — homework!" });
});

// ── CHANGE PASSWORD (homework stub) ─────────────────────────
// HOMEWORK: Implement
// - Require req.body.oldPassword and req.body.newPassword
// - Verify old password with bcrypt.compare
// - Hash new password and update in DB
const changePassword = asyncHandler(async (req, res) => {
  // 👇 YOUR CODE HERE
  res.status(501).json({ success: false, error: "Not implemented — homework!" });
});

module.exports = { register, login, getMe, changePassword };
