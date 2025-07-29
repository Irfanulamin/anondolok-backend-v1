const express = require("express");
const { AuthController } = require("../controllers");
const { auth } = require("../middleware");

const router = express.Router();

// Public routes
router.post("/register", AuthController.register);

router.post("/login", AuthController.login);

router.post("/forgot-password", AuthController.forgotPassword);

router.post("/reset-password", AuthController.resetPassword);

module.exports = router;
