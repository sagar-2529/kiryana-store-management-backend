const express = require("express");
const router = express.Router();
const c = require("../controllers/purchase.controller");
router.post("/", c.create);
router.get("/", c.getAll);
router.get("/:id", c.getById);
router.post("/:id/cancel", c.cancel);
module.exports = router;
