const router = require("express").Router();
const wrap = require("../utils/async-response");
const controller = require("../controllers/item.controller");
const { validate } = require("../middleware/validate");
const { item, idParams } = require("../validation/schemas");
router.route("/").get(wrap(controller.getAll)).post(validate({ body: item.create }), wrap(controller.create));
router.patch("/:id/stock", validate({ params: idParams, body: item.stock }), wrap(controller.increaseStock));
router.route("/:id").get(validate({ params: idParams }), wrap(controller.getById)).put(validate({ params: idParams, body: item.update }), wrap(controller.update)).delete(validate({ params: idParams }), wrap(controller.remove));
module.exports = router;
