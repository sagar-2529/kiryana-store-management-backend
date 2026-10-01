// ============================================================
// Controller: Auth — Register, Login
// ============================================================

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const asyncHandler = require("../middleware/asyncHandler");
const { ValidationError, UnauthorizedError } = require("../utils/errors");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured before starting the API");
}

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

  // This public route is bootstrap-only. Additional staff accounts should be
  // created by a future owner-only administration workflow.
  const adminCount = await prisma.admin.count();
  if (adminCount > 0) {
    throw new UnauthorizedError("An owner account already exists. Please login.");
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

// ── GET ME ──────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { admin: req.admin } });
});

// ── CHANGE PASSWORD ─────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new ValidationError("oldPassword and newPassword are required");
  }
  if (newPassword.length < 6) {
    throw new ValidationError("New password must be at least 6 characters");
  }

  const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
  if (!admin || !(await bcrypt.compare(oldPassword, admin.password))) {
    throw new UnauthorizedError("Current password is incorrect");
  }
  if (await bcrypt.compare(newPassword, admin.password)) {
    throw new ValidationError("New password must be different from the current password");
  }

  await prisma.admin.update({
    where: { id: admin.id },
    data: { password: await bcrypt.hash(newPassword, 12) },
  });
  res.json({ success: true, message: "Password changed successfully" });
});

module.exports = { register, login, getMe, changePassword };
