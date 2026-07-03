// ============================================================
// Auth Middleware — Verifies JWT and attaches admin to req
// ============================================================

const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const { UnauthorizedError } = require("../utils/errors");

const JWT_SECRET = process.env.JWT_SECRET || "kiryana-super-secret-key-change-in-production";

/**
 * Middleware: Verify JWT from Authorization header.
 * On success: attaches req.admin = { id, email, name }
 * On failure: throws UnauthorizedError
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1. Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("No token provided. Use: Authorization: Bearer <token>");
    }

    const token = authHeader.split(" ")[1];

    // 2. Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // 3. Check if admin still exists in DB
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: { id: true, name: true, email: true },
    });

    if (!admin) {
      throw new UnauthorizedError("Admin no longer exists");
    }

    // 4. Attach admin to request
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Invalid token"));
    }
    if (error.name === "TokenExpiredError") {
      return next(new UnauthorizedError("Token expired. Please login again."));
    }
    next(error);
  }
};

module.exports = authMiddleware;
