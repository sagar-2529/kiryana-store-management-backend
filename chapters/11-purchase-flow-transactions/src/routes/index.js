const express = require("express");
const router = express.Router();
router.use("/purchases", require("./purchase.routes"));
module.exports = router;
