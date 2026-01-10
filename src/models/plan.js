const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    returns: { type: String, required: true },
    minAmount: { type: String, required: true },
    duration: { type: String, required: true },
    maxAmount: { type: String, required: true },
    uid: { type: String, ref: "User", required: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", schema);
