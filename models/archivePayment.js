const mongoose = require("mongoose");

const archivePaymentSchema = new mongoose.Schema(
  {
    "Name": {
      type: String,
      required: true,
    },
    "Periodical Deposits": {
      "1st One Lac": { type: Number, default: 0 },
      "2nd One Lac": { type: Number, default: 0 },
      "1st 25,000/-": { type: Number, default: 0 },
      "2nd 25,000/-": { type: Number, default: 0 },
      "3rd 25,000/-": { type: Number, default: 0 },
    },
    "Monthly Subscription": {
      2017: { type: Number, default: 0 },
      2018: { type: Number, default: 0 },
      2019: { type: Number, default: 0 },
      2020: { type: Number, default: 0 },
      2021: { type: Number, default: 0 },
      2022: { type: Number, default: 0 },
      2023: { type: Number, default: 0 },
      2024: { type: Number, default: 0 },
    },
    "Total Deposit": {
      type: Number,
      required: true,
    },
    "username": {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    collection: "archive-payment",
  }
);

module.exports = mongoose.model("ArchivePayment", archivePaymentSchema);
