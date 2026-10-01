const express = require("express");
const auth = require("../middleware/auth");

const authController = require("../../chapters/10-authentication-jwt/src/controllers/auth.controller");
const category = require("../../chapters/05-crud-category-product/src/controllers/category.controller");
const product = require("../../chapters/05-crud-category-product/src/controllers/product.controller");
const item = require("../../chapters/06-crud-item-customer/src/controllers/item.controller");
const customer = require("../../chapters/06-crud-item-customer/src/controllers/customer.controller");
const purchase = require("../../chapters/11-purchase-flow-transactions/src/controllers/purchase.controller");
const credit = require("../../chapters/12-credit-system-advanced-queries/src/controllers/credit.controller");

const router = express.Router();

// Public onboarding routes. In a real store, remove /register after creating the owner account.
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

router.use(auth);
router.get("/auth/me", authController.getMe);
router.put("/auth/change-password", authController.changePassword);

router.route("/categories").get(category.getAll).post(category.create);
router.route("/categories/:id").get(category.getById).put(category.update).delete(category.remove);

router.route("/products").get(product.getAll).post(product.create);
router.route("/products/:id").get(product.getById).put(product.update).delete(product.remove);

router.route("/items").get(item.getAll).post(item.create);
router.route("/items/:id").get(item.getById).put(item.update).delete(item.remove);

router.route("/customers").get(customer.getAll).post(customer.create);
router.route("/customers/:id").get(customer.getById).put(customer.update).delete(customer.remove);
router.get("/customers/:id/purchases", customer.getPurchases);

router.route("/purchases").get(purchase.getAll).post(purchase.create);
router.get("/purchases/:id", purchase.getById);
router.post("/purchases/:id/cancel", purchase.cancel);

router.post("/credits/repay", credit.repay);
router.post("/credits/adjust", credit.adjust);
router.get("/credits/:customerId", credit.getAccount);
router.get("/credits/:customerId/statement", credit.getStatement);

module.exports = router;
