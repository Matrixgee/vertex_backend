const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
    amount: { type: Number, required: true },
    plan_name: { type: String, required: true },
    plan_id: { type: String, required: true },
    investment_id: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Earning", schema);
