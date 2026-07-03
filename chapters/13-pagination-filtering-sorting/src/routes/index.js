const express = require("express"); const router = express.Router();
router.use("/items", require("./item.routes"));
module.exports = router;
