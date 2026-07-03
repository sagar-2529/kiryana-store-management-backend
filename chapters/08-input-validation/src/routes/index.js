const express = require("express");
const router = express.Router();
router.use("/categories", require("./category.routes"));
module.exports = router;
