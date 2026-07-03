const express = require("express");
const router = express.Router();
router.use("/categories", require("./category.routes"));
router.use("/products", require("./product.routes"));
module.exports = router;
