const express = require("express");
const { PaymentController } = require("../controllers");

const router = express.Router();

// routes
router.post("/make-payment", PaymentController.createPayment);
router.get("/payment-history/:username", PaymentController.getPaymentHistory);
router.put("/update-payment", PaymentController.updatePayment);
router.put("/delete-payment/:id", PaymentController.deletePayment);

module.exports = router;
