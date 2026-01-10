const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    uid: { type: String, default: "" },
    amount: { type: Number, default: "" },
    investment_price: { type: Number, default: "" },
    from: { type: String, default: "" },
    to: { type: String, default: "" },
    method: { type: String, default: "" },
    emailAddress: { type: String, default: "" },
    walletAddress: { type: String, default: "" },
    bankName: { type: String, default: "" },
    bankAccount: { type: String, default: "" },
    accountName: { type: String, default: "" },
    routingNumber: { type: String, default: "" },
    plan_name: { type: String, default: "" },
    plan_id: { type: String, default: "" },
    investment_id: { type: String, default: "" },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "investment", "earn"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", schema);
