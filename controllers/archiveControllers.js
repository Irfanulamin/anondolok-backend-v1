const ArchivePayment = require("../models/archivePayment");
const Payment = require("../models/payment");

class ArchivePaymentController {
  // GET /api/archive-payments - Returns all archive payment data exactly as stored
  static async getAllArchivePayments(req, res) {
    try {
      const payments = await ArchivePayment.find({}).lean();

      res.status(200).json(payments);
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch archive payments",
        message: error.message,
      });
    }
  }

  // GET /api/archive-payments/yearly - Returns yearly wise payment data
  static async getYearlyPayments(req, res) {
    try {
      const payments = await ArchivePayment.find({}).lean();

      const yearlyData = {};
      const years = [
        "2024",
        "2023",
        "2022",
        "2021",
        "2020",
        "2019",
        "2018",
        "2017",
      ];

      // Initialize yearly structure
      years.forEach((year) => {
        yearlyData[year] = [];
      });

      // Process each payment record
      payments.forEach((payment) => {
        years.forEach((year) => {
          const amount = payment["Monthly Subscription"][year] || 0;
          if (amount > 0) {
            yearlyData[year].push({
              name: payment.Name,
              username: payment.username,
              amount: amount,
            });
          }
        });
      });

      // Return as array to guarantee order (2024 first, then 2023, etc.)
      const result = years.map((year) => {
        const totalAmount = yearlyData[year].reduce(
          (sum, item) => sum + item.amount,
          0
        );
        return {
          year: year,
          total_amount: totalAmount,
          total_contributors: yearlyData[year].length,
          payments: yearlyData[year],
        };
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch yearly payments",
        message: error.message,
      });
    }
  }

  // GET /api/archive-payments/user/:username - Returns yearly wise payment data for specific user
  static async getUserYearlyPayments(req, res) {
    try {
      const { username } = req.params;

      const payment = await ArchivePayment.findOne({ username }).lean();

      if (!payment) {
        return res.status(404).json({
          error: "User not found",
          message: `No payment record found for username: ${username}`,
        });
      }

      const years = [
        "2017",
        "2018",
        "2019",
        "2020",
        "2021",
        "2022",
        "2023",
        "2024",
      ];
      const userYearlyData = {
        name: payment.Name,
        username: payment.username,
        total_deposit: payment["Total Deposit"],
        periodical_deposits: payment["Periodical Deposits"],
        yearly_payments: {},
      };

      let totalMonthlySubscriptions = 0;

      years.forEach((year) => {
        const amount = payment["Monthly Subscription"][year] || 0;
        userYearlyData.yearly_payments[year] = amount;
        totalMonthlySubscriptions += amount;
      });

      userYearlyData.total_monthly_subscriptions = totalMonthlySubscriptions;

      res.status(200).json(userYearlyData);
    } catch (error) {
      res.status(500).json({
        error: "Failed to fetch user yearly payments",
        message: error.message,
      });
    }
  }

  static async getLifetimeTotal(req, res) {
    try {
      const { username } = req.params;

      // Find archive payment record for the user
      const payment = await ArchivePayment.findOne({ username }).lean();

      if (!payment) {
        return res.status(404).json({
          error: "User not found",
          message: `No archive payment record found for username: ${username}`,
        });
      }

      // Get total deposit from archive (fallback to 0)
      const totalDeposit = payment["Total Deposit"] || 0;

      // Aggregate payments to sum periodicalDeposit and monthlySubscriptionFee
      const totals = await Payment.aggregate([
        { $match: { memberId: username } },
        {
          $group: {
            _id: null,
            totalPeriodicalDeposit: { $sum: "$periodicalDeposit" },
            totalMonthlySubscriptionFee: { $sum: "$monthlySubscriptionFee" },
          },
        },
      ]);

      // Extract sums or default to 0
      const totalPeriodicalDeposit = totals[0]?.totalPeriodicalDeposit || 0;
      const totalMonthlySubscriptionFee =
        totals[0]?.totalMonthlySubscriptionFee || 0;

      // Calculate combined total from live payments
      const totalAmountPaid =
        totalPeriodicalDeposit + totalMonthlySubscriptionFee;

      // Final combined total (archive + live)
      const combinedTotal = totalDeposit + totalAmountPaid;

      // Respond with all totals and user info
      res.status(200).json({
        username: payment.username,
        name: payment.Name,
        totalDeposit,
        totalPeriodicalDeposit,
        totalMonthlySubscriptionFee,
        totalAmountPaid,
        combinedTotal,
      });
    } catch (error) {
      res.status(500).json({
        error: "Failed to calculate deposit and live payment total",
        message: error.message,
      });
    }
  }
}

module.exports = ArchivePaymentController;
