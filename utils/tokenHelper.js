const jwt = require("jsonwebtoken");

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.sign({ userId }, secret, {
    expiresIn: "7d",
  });
};

const verifyTokenUtil = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }
  return jwt.verify(token, secret);
};

const generateResetCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  generateToken,
  verifyTokenUtil,
  generateResetCode,
};
