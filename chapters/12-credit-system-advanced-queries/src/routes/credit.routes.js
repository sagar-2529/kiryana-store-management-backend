const express = require("express");
const router = express.Router();
const c = require("../controllers/credit.controller");
router.post("/repay", c.repay);
router.post("/adjust", c.adjust);
router.get("/:customerId", c.getAccount);
router.get("/:customerId/statement", c.getStatement);
module.exports = router;
