const router = require("express").Router();
const wrap = require("../utils/async-response");
const controller = require("../controllers/category.controller");
const { validate } = require("../middleware/validate");
const { category, query, idParams } = require("../validation/schemas");
router.route("/").get(validate({ query: query.categories }), wrap(controller.getAll)).post(validate({ body: category.create }), wrap(controller.create));
router.route("/:id").get(validate({ params: idParams }), wrap(controller.getById)).put(validate({ params: idParams, body: category.update }), wrap(controller.update)).delete(validate({ params: idParams }), wrap(controller.remove));
module.exports = router;
