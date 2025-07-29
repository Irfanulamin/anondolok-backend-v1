const express = require("express");
const { PaymentAdminController } = require("../controllers");

const router = express.Router();

// routes
router.get("/total-payments", PaymentAdminController.getTotalPaidAnalytics);
router.get(
  "/yearly-wise/:memberId",
  PaymentAdminController.yearlyWiseAnalysisPerUser
);

module.exports = router;
