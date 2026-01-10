const express = require("express");
const User = require("../../models/user");
const Investment = require("../../models/investment");
const Deposit = require("../../models/deposit");
const Withdrawal = require("../../models/withdrawal");
const Earning = require("../../models/earning");
const router = express.Router();

router.get("/", async (req, res) => {
  /**
      #swagger.responses[200] = {
          schema:  { $ref: "#/components/schemas/ProfilesResponse" }
      }
      #swagger.responses[401] = {
          schema: { $ref: '#/definitions/InvalidToken' }
      }
      */
  const users = await User.find();
  const data = [];

  for (const user of users) {
    const _activeInvestments = await Investment.find({
      uid: user.uid,
      active: true,
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

    data.push({
      id: user.id,
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
      verified: user.verified,
      referralId: user.referralId,
      bitcoin: user.bitcoin,
      sol: user.sol,
      ethereum: user.ethereum,
      type: user.type,
      createdAt: user.createdAt.getTime(),
      updatedAt: user.updatedAt.getTime(),
    });
  }

  return res.status(200).json({ message: "success", data });
});

router.get("/:uid", async (req, res) => {
  /**
      #swagger.responses[200] = {
          schema:  { $ref: "#/components/schemas/ProfileResponse" }
      }
      #swagger.responses[401] = {
          schema: { $ref: '#/definitions/InvalidToken' }
      }
      */
  const { uid } = req.params;
  const user = await User.findOne({ uid });

  if (user) {
    const _activeInvestments = await Investment.find({
      uid: user.uid,
      active: true,
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
        id: user.id,
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
        verified: user.verified,
        referralId: user.referralId,
        bitcoin: user.bitcoin,
        sol: user.sol,
        ethereum: user.ethereum,
        type: user.type,
        createdAt: user.createdAt.getTime(),
        updatedAt: user.updatedAt.getTime(),
      },
    });
  } else {
    return res.status(404).json({ message: "User not found" });
  }
});

router.delete("/:uid", async (req, res) => {
  /**
      #swagger.responses[200] = {
          description: "User successfully deleted.",
          schema: { message: "User deleted successfully." }
      }
      #swagger.responses[404] = {
          description: "User not found.",
          schema: { message: "User not found." }
      }
      #swagger.responses[500] = {
          description: "Internal server error.",
          schema: { message: "Something went wrong." }
      }
  */

  const { uid } = req.params;

  try {
    const user = await User.findOneAndDelete({ uid });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    await Investment.deleteMany({ uid });
    await Withdrawal.deleteMany({ uid });
    await Deposit.deleteMany({ uid });
    await Earning.deleteMany({ uid });

    return res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Something went wrong." });
  }
});

module.exports = router;
