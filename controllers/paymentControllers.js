const Payment = require("../models/payment");
const User = require("../models/user");
const {
  sendErrorResponse,
  sendSuccessResponse,
} = require("../utils/responseHelper");

class PaymentController {
  static async createPayment(req, res) {
    try {
      const data = req.body;
      const user = await User.findOne({
        username: data.memberId,
        isActive: true,
      });
      if (!user) throw new Error("User not found or inactive");

      let parsedDate;
      if (data.dateOfDeposit.includes("-") && data.dateOfDeposit.length <= 8) {
        const [month, day, year] = data.dateOfDeposit.split("-");
        const fullYear = year.length === 2 ? `20${year}` : year;
        parsedDate = new Date(
          `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
        );
      } else {
        parsedDate = new Date(data.dateOfDeposit);
      }

      if (isNaN(parsedDate.getTime())) throw new Error("Invalid date format");

      const payment = new Payment({
        ...data,
        memberName: data.memberName,
        memberId: data.memberId,
        dateOfDeposit: parsedDate,
        monthlySubscriptionFee: parseFloat(data.monthlySubscriptionFee) || 0,
        finesPenalty: parseFloat(data.finesPenalty) || 0,
        periodicalDeposit: parseFloat(data.periodicalDeposit) || 0,
        othersAmount: parseFloat(data.othersAmount) || 0,
        othersComment: data.othersComment || "",
        totalAmount:
          parseFloat(data.monthlySubscriptionFee) +
            parseFloat(data.finesPenalty) +
            parseFloat(data.othersAmount) || 0,
      });

      const saved = await payment.save();
      sendSuccessResponse(res, 200, "Payment added successfully");
    } catch (err) {
      sendErrorResponse(res, 400, err.message);
    }
  }

  static async getPaymentHistory(req, res) {
    try {
      const user = await User.findOne({
        username: req.params.username,
        isActive: true,
      });

      if (!user) throw new Error("User not found or inactive");

      const { page = 1, limit = 10, year, month } = req.query;

      const query = { memberId: req.params.username };

      if (year || month) {
        const dateFilter = {};

        if (year && !month) {
          const start = new Date(`${year}-01-01`);
          const end = new Date(`${parseInt(year) + 1}-01-01`);
          dateFilter.$gte = start;
          dateFilter.$lt = end;
        }

        if (month && year) {
          const paddedMonth = month.padStart(2, "0");
          const start = new Date(`${year}-${paddedMonth}-01`);
          const end = new Date(start);
          end.setMonth(end.getMonth() + 1);
          dateFilter.$gte = start;
          dateFilter.$lt = end;
        }

        query.dateOfDeposit = dateFilter;
      }

      const payments = await Payment.find(query)
        .sort({ dateOfDeposit: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean();
      console.log(payments);

      const total = await Payment.countDocuments(query);

      const totalAmount = await Payment.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]);

      res.json({
        payments,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total,
        },
        totalAmountPaid: totalAmount[0]?.total || 0,
        memberInfo: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        },
      });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  static async updatePayment(req, res) {
    try {
      const data = req.body;

      // Find and verify the user by username and isActive
      const user = await User.findOne({
        username: data.memberId,
        isActive: true,
      });
      if (!user) throw new Error("User not found or inactive");

      // Find the payment record by _id
      const payment = await Payment.findById(data._id);
      if (!payment) throw new Error("Payment record not found");

      // Update payment fields
      payment.monthlySubscriptionFee =
        parseFloat(data.monthlySubscriptionFee) || 0;
      payment.finesPenalty = parseFloat(data.finesPenalty) || 0;
      payment.periodicalDeposit = parseFloat(data.periodicalDeposit) || 0;
      payment.othersAmount = parseFloat(data.othersAmount) || 0;
      payment.othersComment = data.othersComment || "";

      // Recalculate totalAmount
      payment.totalAmount =
        payment.monthlySubscriptionFee +
        payment.finesPenalty +
        payment.periodicalDeposit +
        payment.othersAmount;

      // Save updated payment
      await payment.save();

      sendSuccessResponse(res, 200, "Payment updated successfully");
    } catch (err) {
      sendErrorResponse(res, 400, err.message);
    }
  }
}

module.exports = PaymentController;
