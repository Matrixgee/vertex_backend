const express = require("express");
const User = require("../models/user");
const Investment = require("../models/investment");
const Deposit = require("../models/deposit");
const Withdrawal = require("../models/withdrawal");
const Earning = require("../models/earning");
const router = express.Router();

router.get("/profile", async (req, res) => {
  /**
    #swagger.responses[200] = {
        schema:  { $ref: "#/components/schemas/ProfileResponse" }
    }
    #swagger.responses[401] = {
        schema: { $ref: '#/definitions/InvalidToken' }
    }
    */
  const { uid, type } = req.user;
  const user = await User.findOne({ uid, type });

  if (user) {
    const _activeInvestments = await Investment.find({
      uid: user.uid,
      status: "approved",
    });
    const activeInvestments = _activeInvestments.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0
    );

    const _pendingWithdrawals = await Withdrawal.find({
      uid: user.uid,
      status: "pending",
    });
    const pendingWithdrawals = _pendingWithdrawals.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0
    );

    const _totalWithdrawals = await Withdrawal.find({
      uid: user.uid,
      status: "approved",
    });
    const totalWithdrawals = _totalWithdrawals.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0
    );

    const _totalDeposits = await Deposit.find({
      uid: user.uid,
      status: "approved",
    });
    const totalDeposits = _totalDeposits.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0
    );

    const _earnings = await Earning.find({ uid: user.uid });
    const earnings = _earnings.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0
    );

    return res.status(200).json({
      message: "success",
      data: {
        name: user.name,
        username: user.username,
        uid: user.uid,
        email: user.email,
        password: user.password,
        balance: user.balance,
        activeInvestments: activeInvestments,
        pendingWithdrawals: pendingWithdrawals,
        totalWithdrawals: totalWithdrawals,
        totalDeposits: totalDeposits,
        earnings: earnings,
        btcBal: user.btcBal,
        ethBal: user.ethBal,
        solBal: user.solBal,
        verified: user.verified,
        referralId: user.referralId,
        bitcoin: user.bitcoin,
        sol: user.sol,
        ethereum: user.ethereum,
        type: user.type,
        profilePic: user.profilePic,
        phoneNumber: user.phoneNumber,
        dob: user.dob,
        state: user.state,
        city: user.city,
        bankName: user.bankName,
        accountNumber: user.accountNumber,
        routingNumber: user.routingNumber,
        createdAt: user.createdAt.getTime(),
        updatedAt: user.updatedAt.getTime(),
      },
    });
  } else {
    return res.status(404).json({ message: "User not found" });
  }
});

router.patch("/profile", async (req, res) => {
  /**
    #swagger.requestBody = {
        required: true,
        schema: { $ref: "#/components/schemas/ProfileRequest" }
    }
    #swagger.responses[200] = {
        schema:  { $ref: "#/components/schemas/ProfileResponse" }
    }
    #swagger.responses[401] = {
        schema: { $ref: '#/definitions/InvalidToken' }
    }
    */
  const { uid, type } = req.user;
  const {
    bitcoin,
    sol,
    ethereum,
    profilePic,
    phoneNumber,
    dob,
    state,
    city,
    bankName,
    accountNumber,
    routingNumber,
  } = req.body;

  if (
    !(
      bitcoin ||
      ethereum ||
      profilePic ||
      bitcoin ||
      sol ||
      ethereum ||
      profilePic ||
      phoneNumber ||
      dob ||
      state ||
      city ||
      bankName ||
      accountNumber ||
      routingNumber
    )
  ) {
    return res.status(400).json({
      message:
        "Bad Request `bitcoin`, `usdt`, `ethereum`, `profilePic is required.",
    });
  }

  let user = await User.findOne({ uid, type });

  if (user) {
    if (bitcoin !== undefined) user.bitcoin = bitcoin || "";
    if (sol !== undefined) user.sol = sol || "";
    if (ethereum !== undefined) user.ethereum = ethereum || "";
    if (profilePic !== undefined) user.profilePic = profilePic || "";
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber || "";
    if (dob !== undefined) user.dob = dob || null;
    if (state !== undefined) user.state = state || "";
    if (city !== undefined) user.city = city || "";
    if (bankName !== undefined) user.bankName = bankName || "";
    if (accountNumber !== undefined) user.accountNumber = accountNumber || "";
    if (routingNumber !== undefined) user.routingNumber = routingNumber || "";
    await user.save();

    return res.status(200).json({
      message: "success",
      data: {
        name: user.name,
        username: user.username,
        uid: user.uid,
        email: user.email,
        profilePic: user.profilePic,
        balance: user.balance,
        verified: user.verified,
        referralId: user.referralId,
        bitcoin: user.bitcoin,
        sol: user.sol,
        ethereum: user.ethereum,
        type: user.type,
        city: user.city,
        bankName: user.bankName,
        accountNumber: user.accountNumber,
        routingNumber: user.routingNumber,
        dob: user.dob,
        state: user.state,
        createdAt: user.createdAt.getTime(),
        updatedAt: user.updatedAt.getTime(),
      },
    });
  } else {
    return res.status(404).json({ message: "User not found" });
  }
});

module.exports = router;
