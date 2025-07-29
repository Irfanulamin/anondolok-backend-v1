const { User } = require("../models/user");
const { sendErrorResponse } = require("../utils/responseHelper");
const { verifyTokenUtil } = require("../utils/tokenHelper");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return sendErrorResponse(res, 401, "Access denied. No token provided.");
    }

    const decoded = verifyTokenUtil(token);
    const user = await User.findById(decoded.userId).select(
      "-password -resetCode"
    );

    if (!user || !user.isActive) {
      return sendErrorResponse(res, 401, "Invalid token or inactive user");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return sendErrorResponse(res, 401, "Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      return sendErrorResponse(res, 401, "Token expired");
    }
    console.error("Token verification error:", error);
    sendErrorResponse(res, 401, "Token verification failed");
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return sendErrorResponse(
      res,
      403,
      "Access denied. Admin privileges required."
    );
  }
  next();
};

module.exports = {
  verifyToken,
  adminOnly,
};
