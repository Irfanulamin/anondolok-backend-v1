const express = require("express");
const authRoutes = require("./auth");
const adminRoutes = require("./admin");
const paymentRoutes = require("./payment");
const adminPaymentRoutes = require("./adminPayment");

const router = express.Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/payment", paymentRoutes);
router.use("/admin-payment", adminPaymentRoutes);

module.exports = router;
