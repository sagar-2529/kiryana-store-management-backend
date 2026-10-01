const router = require("express").Router();
const wrap = require("../utils/async-response");
const controller = require("../controllers/customer.controller");
router.route("/").get(wrap(controller.getAll)).post(wrap(controller.create));
router.get("/:id/purchases", wrap(controller.getPurchases));
router.route("/:id").get(wrap(controller.getById)).put(wrap(controller.update)).delete(wrap(controller.remove));
module.exports = router;
