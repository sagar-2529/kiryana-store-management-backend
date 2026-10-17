const router = require("express").Router();
const wrap = require("../utils/async-response");
const controller = require("../controllers/customer.controller");
const { validate } = require("../middleware/validate");
const { customer, idParams } = require("../validation/schemas");
router.route("/").get(wrap(controller.getAll)).post(validate({ body: customer.create }), wrap(controller.create));
router.get("/:id/purchases", validate({ params: idParams }), wrap(controller.getPurchases));
router.route("/:id").get(validate({ params: idParams }), wrap(controller.getById)).put(validate({ params: idParams, body: customer.update }), wrap(controller.update)).delete(validate({ params: idParams }), wrap(controller.remove));
module.exports = router;
