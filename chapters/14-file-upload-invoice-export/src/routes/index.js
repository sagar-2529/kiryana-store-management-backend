const express = require("express"); const router = express.Router();
const upload = require("../config/multer");
const exportCtrl = require("../controllers/export.controller");
const uploadCtrl = require("../controllers/upload.controller");

router.get("/exports/purchases", exportCtrl.exportPurchases);
router.get("/exports/items", exportCtrl.exportItems);
router.post("/items/:id/image", upload.single("image"), uploadCtrl.uploadItemImage);
// HOMEWORK: router.get("/exports/customers", exportCtrl.exportCustomers);
// HOMEWORK: router.get("/purchases/:id/invoice", invoiceCtrl.generatePDF);
module.exports = router;
