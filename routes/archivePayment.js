const express = require("express");
const { ArchivePaymentController } = require("../controllers");

const router = express.Router();

router.get("/", ArchivePaymentController.getAllArchivePayments);
router.get("/yearly", ArchivePaymentController.getYearlyPayments);
router.get("/user/:username", ArchivePaymentController.getUserYearlyPayments);

module.exports = router;
