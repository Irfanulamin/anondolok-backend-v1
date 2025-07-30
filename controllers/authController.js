const User = require("../models/user");
const {
  sendErrorResponse,
  sendSuccessResponse,
} = require("../utils/responseHelper");
const { generateToken } = require("../utils/tokenHelper");
const { getEmailTransporter } = require("../config/email");
const bcrypt = require("bcrypt");

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

      // Generate reset code - IMPORT THIS FROM YOUR MODULE
      const { generateResetCode } = require("../config/email"); // FIX PATH
      const resetCode = generateResetCode();

      // Hash the reset code before saving
      const saltRounds = 10;
      const hashedResetCode = await bcrypt.hash(resetCode, saltRounds);

      // Save hashed reset code to user
      user.resetCode = hashedResetCode;
      await user.save();

      // Check if transporter is available
      const transporter = getEmailTransporter();
      if (!transporter) {
        console.error("Email service is not configured");
        return sendErrorResponse(
          res,
          500,
          "Email service is temporarily unavailable"
        );
      }

      // Send email - WRAP IN TRY-CATCH
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
          <p style="color: #666;">If you didn't request this password reset, please ignore this email.</p>
        </div>
      `,
      };

      // FIX: ADD TRY-CATCH FOR EMAIL SENDING
      try {
        await transporter.sendMail(mailOptions);
        sendSuccessResponse(res, 200, "Reset code sent to your email");
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        return sendErrorResponse(res, 500, "Failed to send reset code");
      }
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

      // Check if reset code exists and verify it with bcrypt
      if (!user.resetCode) {
        return sendErrorResponse(res, 400, "Invalid reset code");
      }

      const isValidCode = await bcrypt.compare(code, user.resetCode);
      if (!isValidCode) {
        return sendErrorResponse(res, 400, "Invalid reset code");
      }

      // Update user password and clear reset code
      await User.updateOne(
        { email },
        {
          $set: {
            password: newPassword,
          },
          $unset: {
            resetCode: null,
          },
        }
      );

      sendSuccessResponse(res, 200, "Password reset successfully");
    } catch (error) {
      console.error("Reset password error:", error);
      sendErrorResponse(res, 500, "Failed to reset password");
    }
  }
}

module.exports = AuthController;
