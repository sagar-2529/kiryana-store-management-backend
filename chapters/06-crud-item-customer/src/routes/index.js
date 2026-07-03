const express = require("express");
const router = express.Router();
router.use("/items", require("./item.routes"));
router.use("/customers", require("./customer.routes"));
module.exports = router;
