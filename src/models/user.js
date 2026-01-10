const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    username: { type: String, default: "" },
    uid: { type: String, required: true },
    email: {
      type: String,
      required: true,
      default: "",
      unique: true,
    },
    password: { type: String, required: true },
    balance: { type: Number, default: 0 },
    btcBal: { type: Number, default: 0 },
    usdtBal: { type: Number, default: 0 },
    ethBal: { type: Number, default: 0 },
    solBal: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    referralId: { type: String, default: "" },
    bitcoin: { type: String, default: "" },
    sol: { type: String, default: "" },
    ethereum: { type: String, default: "" },
    profilePic: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    dob: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    routingNumber: { type: String, default: "" },
    type: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", schema);
