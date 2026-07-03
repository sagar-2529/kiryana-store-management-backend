const express = require("express");
const router = express.Router();

const adminRoutes = require("./admin.routes");
const categoryRoutes = require("./category.routes");
const productRoutes = require("./product.routes");
const itemRoutes = require("./item.routes");

router.use("/admin", adminRoutes);
router.use("/categories", categoryRoutes);
router.use("/products", productRoutes);
router.use("/items", itemRoutes);

module.exports = router;