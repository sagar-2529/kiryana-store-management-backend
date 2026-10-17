const router = require("express").Router();
const wrap = require("../utils/async-response");
const controller = require("../controllers/purchase.controller");
const { validate } = require("../middleware/validate");
const { purchase, idParams } = require("../validation/schemas");
router.route("/").get(wrap(controller.getAll)).post(validate({ body: purchase.create }), wrap(controller.create));
router.post("/:id/cancel", validate({ params: idParams }), wrap(controller.cancel));
router.get("/:id", validate({ params: idParams }), wrap(controller.getById));
module.exports = router;
