const User = require("../models/user");
const {
  sendErrorResponse,
  sendSuccessResponse,
} = require("../utils/responseHelper");

class AdminController {
  // Get All Users
  static async getAllUsers(req, res) {
    try {
      const users = await User.find()
        .select("-password -resetCode")
        .populate("createdBy", "username email")
        .sort({ createdAt: -1 });

      sendSuccessResponse(res, 200, "Users retrieved successfully", {
        users,
        total: users.length,
      });
    } catch (error) {
      console.error("Get users error:", error);
      sendErrorResponse(res, 500, "Failed to retrieve users");
    }
  }

  // Update User Role
  static async updateUserRole(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return sendErrorResponse(res, 404, "User not found");
      }

      // Determine new role (toggle)
      const newRole = user.role === "admin" ? "user" : "admin";

      // Prevent demoting the last admin
      if (user.role === "admin" && newRole === "user") {
        const adminCount = await User.countDocuments({
          role: "admin",
          isActive: true,
        });
        if (adminCount <= 1) {
          return sendErrorResponse(
            res,
            400,
            "Cannot demote the last active admin user"
          );
        }
      }

      user.role = newRole;
      await user.save();

      sendSuccessResponse(res, 200, `User role toggled to ${newRole}`, {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Update user role error:", error);
      sendErrorResponse(res, 500, "Failed to toggle user role");
    }
  }

  // Deactivate User
  static async deactivateUser(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user) {
        return sendErrorResponse(res, 404, "User not found");
      }

      // Toggle isActive
      user.isActive = !user.isActive;
      await user.save();

      const statusMsg = user.isActive ? "User reactivated" : "User deactivated";

      sendSuccessResponse(res, 200, `${statusMsg} successfully`, {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      console.error("Deactivate user error:", error);
      sendErrorResponse(res, 500, "Failed to toggle user status");
    }
  }
}

module.exports = AdminController;
