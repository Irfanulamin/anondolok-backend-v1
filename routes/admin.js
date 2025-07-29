const express = require("express");
const { AdminController } = require("../controllers");
const { auth } = require("../middleware");

const router = express.Router();

// Admin routes
router.get("/users", AdminController.getAllUsers);

router.patch("/users/role/:userId", AdminController.updateUserRole);

router.patch("/users/deactivate/:userId", AdminController.deactivateUser);

module.exports = router;
