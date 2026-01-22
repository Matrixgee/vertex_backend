const express = require("express");
const router = express.Router();
const User = require("../../models/user");

/**
 * ADMIN: Credit / Debit User Wallet
 * PUT /admin/credit/:uid
 *
 * body:
 * {
 *   "wallet": "balance" | "bitcoin" | "ethereum" | "sol",
 *   "amount": 500,
 *   "action": "credit" | "debit"
 * }
 */
router.patch("/:uid", async (req, res) => {
  const { uid } = req.params;
  const { wallet, amount, action } = req.body;

  // ✅ Basic validation
  if (!wallet || amount === undefined || !action) {
    return res.status(400).json({
      message: "wallet, amount and action are required",
    });
  }

  const parsedAmount = Number(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({
      message: "Amount must be a valid positive number",
    });
  }

  if (!["credit", "debit"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  // 🔒 Allowed wallets
  const allowedWallets = ["balance", "bitcoin", "ethereum", "sol"];

  if (!allowedWallets.includes(wallet)) {
    return res.status(400).json({ message: "Invalid wallet type" });
  }

  try {
    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentValue = Number(user[wallet] || 0);

    if (action === "debit" && currentValue < parsedAmount) {
      return res.status(400).json({
        message: "Insufficient balance",
      });
    }

    // ✅ Apply adjustment
    user[wallet] =
      action === "credit"
        ? currentValue + parsedAmount
        : currentValue - parsedAmount;

    await user.save();

    return res.status(200).json({
      message: "Balance updated successfully",
      data: {
        uid: user.uid,
        wallet,
        action,
        amount: parsedAmount,
        newBalance: user[wallet],
      },
    });
  } catch (error) {
    console.error("Balance adjustment error:", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

module.exports = router;
