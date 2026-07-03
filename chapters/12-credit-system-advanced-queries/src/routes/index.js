const express = require("express"); const router = express.Router();
router.use("/credits", require("./credit.routes"));
// HOMEWORK: Add report routes
// router.use("/reports", require("./report.routes"));
module.exports = router;
