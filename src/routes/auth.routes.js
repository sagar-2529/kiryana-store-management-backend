const router = require("express").Router();
const auth = require("../middleware/auth");
const wrap = require("../utils/async-response");
const controller = require("../controllers/auth.controller");
router.post("/register", wrap(controller.register));
router.post("/login", wrap(controller.login));
router.get("/me", auth, controller.getMe);
router.put("/change-password", auth, wrap(controller.changePassword));
module.exports = router;
