const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

// Public authentication endpoints.
router.use("/auth", require("./auth.routes"));

// Every store-management endpoint requires an owner token.
router.use(auth);
router.use("/categories", require("./category.routes"));
router.use("/products", require("./product.routes"));
router.use("/items", require("./item.routes"));
router.use("/customers", require("./customer.routes"));
router.use("/purchases", require("./purchase.routes"));
router.use("/credits", require("./credit.routes"));

module.exports = router;
