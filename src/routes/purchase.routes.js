const router = require("express").Router();
const wrap = require("../utils/async-response");
const controller = require("../controllers/purchase.controller");
router.route("/").get(wrap(controller.getAll)).post(wrap(controller.create));
router.post("/:id/cancel", wrap(controller.cancel));
router.get("/:id", wrap(controller.getById));
module.exports = router;
