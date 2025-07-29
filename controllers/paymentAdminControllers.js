const Payment = require("../models/payment");
const User = require("../models/user");

class PaymenentAdminController {
  static async getTotalPaidAnalytics(req, res) {
    try {
      const analytics = await Payment.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$dateOfDeposit" },
              month: { $month: "$dateOfDeposit" },
              memberId: "$memberId",
              memberName: "$memberName",
            },
            totalAmount: { $sum: "$totalAmount" },
            totalMonthlyFees: { $sum: "$monthlySubscriptionFee" },
            totalFines: { $sum: "$finesPenalty" },
            totalPeriodical: { $sum: "$periodicalDeposit" },
            totalOthers: { $sum: "$othersAmount" },
            othersComment: { $first: "$othersComment" },
          },
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
      ]).allowDiskUse(true);

      return res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      console.error("Analytics error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Analytics failed" });
    }
  }
  static async yearlyWiseAnalysisPerUser(req, res) {
    try {
      const memberId = req.params.memberId;

      if (!memberId) {
        return res
          .status(400)
          .json({ success: false, message: "memberId is required" });
      }

      const analytics = await Payment.aggregate([
        {
          $match: { memberId: memberId }, // Filter payments for this user
        },
        {
          $group: {
            _id: {
              year: { $year: "$dateOfDeposit" }, // Group only by year
            },
            totalAmount: { $sum: "$totalAmount" },
            totalMonthlyFees: { $sum: "$monthlySubscriptionFee" },
            totalFines: { $sum: "$finesPenalty" },
            totalPeriodical: { $sum: "$periodicalDeposit" },
            totalOthers: { $sum: "$othersAmount" },
          },
        },
        {
          $sort: {
            "_id.year": -1,
          },
        },
      ]).allowDiskUse(true);

      return res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      console.error("Yearly analysis per user error:", error);
      return res
        .status(500)
        .json({ success: false, message: "Yearly analysis failed" });
    }
  }
}

module.exports = PaymenentAdminController;
