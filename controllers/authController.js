const User = require("../models/user");
const {
  sendErrorResponse,
  sendSuccessResponse,
} = require("../utils/responseHelper");
const { generateToken, generateResetCode } = require("../utils/tokenHelper");
const { getEmailTransporter } = require("../config/email");

class AuthController {
  // Register User
  static async register(req, res) {
    try {
      const { username, email, password, role = "user" } = req.body;
      const existingUser = await User.findOne({
        $or: [{ email }, { username }],
      });

      if (existingUser) {
        const field = existingUser.email === email ? "email" : "username";
        return sendErrorResponse(
          res,
          400,
          `User with this ${field} already exists`
        );
      }

      const user = new User({
        username,
        email,
        password,
        role,
        createdBy: req.createdBy || null,
      });

      await user.save();

      const token = generateToken(user._id);

      sendSuccessResponse(res, 201, "User is created Sucessfully", {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return sendErrorResponse(
          res,
          400,
          `User with this ${field} already exists`
        );
      }

      console.error("Register error:", error);
      sendErrorResponse(res, 500, "Internal server error");
    }
  }

  // Login User
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ username, isActive: true });
      if (!user) {
        return sendErrorResponse(res, 401, "User not found or inactive");
      }

      if (user.password !== password) {
        return sendErrorResponse(res, 401, "Invalid password");
      }

      const token = generateToken(user._id);

      sendSuccessResponse(res, 200, "Login successful", {
        token,
        user: {
          role: user.role,
          username: user.username,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      sendErrorResponse(res, 500, "Internal server error");
    }
  }

  // Forgot Password
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Find user
      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        // For security, don't reveal if email exists
        return sendSuccessResponse(
          res,
          200,
          "If the email exists, a reset code has been sent"
        );
      }

      // Generate reset code
      const resetCode = generateResetCode();
      const resetCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save reset code to user
      user.resetCode = resetCode;
      user.resetCodeExpires = resetCodeExpires;
      await user.save();

      // Check if transporter is available
      const transporter = getEmailTransporter();
      console.log(transporter);
      if (!transporter) {
        console.error("Email service is not configured");
        return sendErrorResponse(
          res,
          500,
          "Email service is temporarily unavailable"
        );
      }

      // Send email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>You have requested to reset your password. Use the following 6-digit code to reset your password:</p>
            <div style="background-color: #f5f5f5; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${resetCode}</h1>
            </div>
            <p style="color: #666;">This code will expire in 10 minutes.</p>
            <p style="color: #666;">If you didn't request this password reset, please ignore this email.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);

      sendSuccessResponse(res, 200, "Reset code sent to your email");
    } catch (error) {
      console.error("Forgot password error:", error);
      sendErrorResponse(res, 500, "Failed to send reset code");
    }
  }

  // Reset Password
  static async resetPassword(req, res) {
    try {
      const { email, code, newPassword } = req.body;

      // Find user
      const user = await User.findOne({ email, isActive: true });
      if (!user) {
        return sendErrorResponse(res, 404, "User not found");
      }

      // Check if reset code is valid and not expired
      if (!user.resetCode || user.resetCode !== code) {
        return sendErrorResponse(res, 400, "Invalid reset code");
      }

      if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
        return sendErrorResponse(res, 400, "Reset code has expired");
      }
      // Update user password and clear reset code
      user.password = newPassword;
      user.resetCode = null;
      user.resetCodeExpires = null;
      await user.save();

      sendSuccessResponse(res, 200, "Password reset successfully");
    } catch (error) {
      console.error("Reset password error:", error);
      sendErrorResponse(res, 500, "Failed to reset password");
    }
  }
}

module.exports = AuthController;
