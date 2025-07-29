const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  memberName: {
    type: String,
    required: true,
    trim: true,
  },
  memberId: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfDeposit: {
    type: Date,
    required: true,
  },
  typeOfDeposit: {
    type: String,
    required: true,
    enum: ["BEFTN", "BANK", "NSPB"],
  },
  bankName: {
    type: String,
    required: true,
    trim: true,
  },
  bankBranch: {
    type: String,
    required: true,
    trim: true,
  },
  monthlySubscriptionFee: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  finesPenalty: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  periodicalDeposit: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  othersAmount: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  othersComment: {
    type: String,
    trim: true,
    default: "",
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Payment = mongoose.model("Payment", paymentSchema, "payments");
module.exports = Payment;
