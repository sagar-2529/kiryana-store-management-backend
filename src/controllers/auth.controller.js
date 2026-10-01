const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { fail } = require("../services/store.service");

function tokenFor(admin) {
  return jwt.sign(
    { adminId: admin.id, email: admin.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

async function register(req, res) {
  const { name, password } = req.body;
  const email = req.body.email?.trim().toLowerCase();
  if (!name || !email || !password || password.length < 6) {
    fail("Name, email and a password of at least 6 characters are required");
  }
  if (await prisma.admin.count()) fail("An owner account already exists. Please login.", 401);

  const admin = await prisma.admin.create({
    data: { name, email, password: await bcrypt.hash(password, 12) },
    select: { id: true, name: true, email: true },
  });
  res.status(201).json({ success: true, data: { admin, token: tokenFor(admin) } });
}

async function login(req, res) {
  const { password } = req.body;
  const email = req.body.email?.trim().toLowerCase();
  const admin = email && await prisma.admin.findUnique({ where: { email } });
  if (!admin || !password || !await bcrypt.compare(password, admin.password)) {
    fail("Invalid email or password", 401);
  }
  res.json({ success: true, data: { admin: { id: admin.id, name: admin.name, email: admin.email }, token: tokenFor(admin) } });
}

function getMe(req, res) {
  res.json({ success: true, data: { admin: req.admin } });
}

async function changePassword(req, res) {
  const { oldPassword, newPassword } = req.body;
  const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
  if (!oldPassword || !newPassword || newPassword.length < 6) fail("A new password of at least 6 characters is required");
  if (!await bcrypt.compare(oldPassword, admin.password)) fail("Current password is incorrect", 401);
  await prisma.admin.update({ where: { id: admin.id }, data: { password: await bcrypt.hash(newPassword, 12) } });
  res.json({ success: true, message: "Password changed" });
}

module.exports = { register, login, getMe, changePassword };
