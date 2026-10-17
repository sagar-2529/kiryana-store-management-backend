const router = require("express").Router();
const wrap = require("../utils/async-response");
const controller = require("../controllers/product.controller");
const { validate } = require("../middleware/validate");
const { product, query, idParams } = require("../validation/schemas");
router.route("/").get(validate({ query: query.products }), wrap(controller.getAll)).post(validate({ body: product.create }), wrap(controller.create));
router.route("/:id").get(validate({ params: idParams }), wrap(controller.getById)).put(validate({ params: idParams, body: product.update }), wrap(controller.update)).delete(validate({ params: idParams }), wrap(controller.remove));
module.exports = router;
