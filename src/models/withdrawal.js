const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
    amount: { type: Number, default: "" },
    to: { type: String, default: "" },
    method: { type: String, default: "" },
    emailAddress: { type: String, default: "" },
    walletAddress: { type: String, default: "" },
    bankName: { type: String, default: "" },
    accountName: { type: String, default: "" },
    routingNumber: { type: String, default: "" },
    bankAccount: { type: String, default: "" },
    transaction_id: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Withdrawal", schema);
