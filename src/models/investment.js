const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    plan_id: { type: String, required: true },
    plan_name: { type: String, required: true },
    method: { type: String, required: true },
    duration: { type: String, required: true },
    amount: { type: Number, required: true },
    returns: { type: Number, required: true },
    active: { type: Boolean, default: false },
    creditedAmount: { type: Number, default: 0 },
    lastCreditedAt: { type: Date, default: null },
    status: {
      type: String,
      // enum: ["pending", "active", "ended", "declined"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Investment", schema);
