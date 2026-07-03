// ============================================================
// Controller: Admin
// ============================================================

const { sendSuccess } = require("../utils/response");

// In-memory admin (will come from DB in Chapter 04+)
const admin = {
  id: 1,
  name: "Store Owner",
  email: "owner@kiryana.com",
  role: "ADMIN",
};

const getProfile = (req, res) => {
  sendSuccess(res, 200, admin, "Admin profile retrieved");
};

module.exports = { getProfile };
