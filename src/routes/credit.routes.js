const router = require("express").Router();
const wrap = require("../utils/async-response");
const controller = require("../controllers/credit.controller");
router.post("/repay", wrap(controller.repay));
router.get("/:customerId/statement", wrap(controller.getStatement));
router.get("/:customerId", wrap(controller.getAccount));
module.exports = router;
