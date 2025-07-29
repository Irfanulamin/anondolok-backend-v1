// =============================================
// 3. CONFIG/EMAIL.JS - Email Configuration
// =============================================

const nodemailer = require("nodemailer");

let transporter;

const initializeEmailTransporter = () => {
  try {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify transporter configuration
    transporter.verify((error, success) => {
      if (error) {
        console.error("Email transporter error:", error);
      } else {
        console.log("Email server is ready to send messages");
      }
    });
  } catch (error) {
    console.error("Failed to create email transporter:", error);
  }
};
const getEmailTransporter = () => transporter;

module.exports = {
  initializeEmailTransporter,
  getEmailTransporter,
};
