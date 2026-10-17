const router = require("express").Router();
const wrap = require("../utils/async-response");
const controller = require("../controllers/credit.controller");
const { validate } = require("../middleware/validate");
const { credit, customerIdParams } = require("../validation/schemas");
router.post("/repay", validate({ body: credit.repay }), wrap(controller.repay));
router.get("/:customerId/statement", validate({ params: customerIdParams }), wrap(controller.getStatement));
router.get("/:customerId", validate({ params: customerIdParams }), wrap(controller.getAccount));
module.exports = router;
