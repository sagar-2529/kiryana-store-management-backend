const express = require("express");
const router = express.Router();

const categoryRoutes = require("./category.routes");
const productRoutes = require("./product.routes");
const itemRoutes = require("./item.routes");
const purchaseRoutes = require("./purchase.routes");
const customerRoutes = require("./customer.routes");

router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/items", itemRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/customers", customerRoutes);

module.exports = router;
