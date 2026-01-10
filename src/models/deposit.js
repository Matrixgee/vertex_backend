const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
    amount: { type: Number, default: 0 },
    from: { type: String, required: true },
    to: { type: String, required: true },
    method: { type: String, required: true },
    transaction_id: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Deposit", schema);
