const express = require("express");
const Withdrawal = require("../../models/withdrawal");
const Transaction = require("../../models/transaction");
const User = require("../../models/user");
const { toObjectId, isValidObjectId } = require("../../utils/mongoose_utils");
const deposit = require("../../models/deposit");
const { sendMail } = require("../../services/mail");
const Earnings = require("../../models/earning");

const router = express.Router();

router.get("/all", async (req, res) => {
  /**
        #swagger.responses[200] = {
            schema:  { $ref: "#/components/schemas/WithdrawalsResponse" }
        }
        #swagger.responses[401] = {
            schema: { $ref: '#/definitions/InvalidToken' }
        }
        #swagger.responses[404] = {
            schema: { $ref: '#/definitions/NotExists' }
        }
        #swagger.responses[406] = {
            schema: { $ref: '#/definitions/InvalidID' }
        }
      */
  const withdrawals = await Withdrawal.find();
  const data = [];

  for (const withdrawal of withdrawals) {
    const user = await User.findOne({ uid: withdrawal.uid });

    data.push({
      id: withdrawal.id,
      uid: withdrawal.uid,
      user: user
        ? {
            name: user.name,
            email: user.email,
          }
        : "",
      amount: withdrawal.amount,
      to: withdrawal.to,
      method: withdrawal.method,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt.getTime(),
      updatedAt: withdrawal.updatedAt.getTime(),
    });
  }

  return res.status(200).json({ message: "success", data });
});

router.get("/user/:uid", async (req, res) => {
  /**
        #swagger.responses[200] = {
            schema:  { $ref: "#/components/schemas/WithdrawalsResponse" }
        }
        #swagger.responses[401] = {
            schema: { $ref: '#/definitions/InvalidToken' }
        }
        #swagger.responses[404] = {
            schema: { $ref: '#/definitions/NotExists' }
        }
        #swagger.responses[406] = {
            schema: { $ref: '#/definitions/InvalidID' }
        }
      */
  const { uid } = req.params;
  const withdrawals = await Withdrawal.find({ uid });
  const data = [];

  withdrawals.forEach((withdrawal) =>
    data.push({
      id: withdrawal.id,
      uid: withdrawal.uid,
      amount: withdrawal.amount,
      to: withdrawal.to,
      method: withdrawal.method,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt.getTime(),
      updatedAt: withdrawal.updatedAt.getTime(),
    })
  );

  return res.status(200).json({ message: "success", data });
});

router.patch("/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(406).json({ message: "Invalid withdrawal ID." });
    }

    const withdrawal = await Withdrawal.findById(toObjectId(id));
    if (!withdrawal || !withdrawal.uid) {
      return res.status(404).json({ message: "Withdrawal not found." });
    }

    const user = await User.findOne({ uid: withdrawal.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const transaction = await Transaction.findById(
      toObjectId(withdrawal.transaction_id)
    );
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    // Check if the user's balance is sufficient
    if (withdrawal.amount > user.balance) {
      return res
        .status(400)
        .json({ message: "User does not have sufficient balance." });
    }

    // Fetch all earnings for the user
    const earnings = await Earnings.find({ uid: user.uid });
    const totalEarnings = earnings.reduce(
      (sum, earning) => sum + earning.amount,
      0
    );

    // Check if the total earnings are sufficient to cover the withdrawal
    if (withdrawal.amount > totalEarnings) {
      return res
        .status(400)
        .json({ message: "Insufficient earnings to cover the withdrawal." });
    }

    // Proceed to deduct from balance and earnings
    withdrawal.status = "approved";
    transaction.status = "approved";

    user.balance -= withdrawal.amount;

    // Subtract the withdrawal amount from earnings
    let remainingAmount = withdrawal.amount;
    for (const earning of earnings) {
      if (earning.amount >= remainingAmount) {
        earning.amount -= remainingAmount;
        await earning.save();
        break;
      } else {
        remainingAmount -= earning.amount;
        earning.amount = 0;
        await earning.save();
      }
    }

    await withdrawal.save();
    await transaction.save();
    await user.save();

    const html = `
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title></title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #191c24;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #fff;
        color: #191c24;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      h2 {
        color: #010647;
        margin-top: 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
        text-transform:capitalize;
      }
      th {
        background-color: #f2f2f2;
      }
      td {
        background-color: #ffffff;
      }
      ul {
        list-style-type: none;
        padding: 0;
      }
      a {
        color: #007bff;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>TradeMark Investments Electronic Notification</h2>
      <p>
        We wish to inform you that a Transaction occurred on your account with
        us.
      </p>
      <h3>Transaction Notification</h3>
      <table>
        <tr>
          <th>Transaction ID:</th>
          <td>${transaction.id}</td>
        </tr>
        <tr>
          <th>Transaction Type:</th>
          <td>WITHDRAWAL</td>
        </tr>
        <tr>
          <th>Amount:</th>
          <td>

            ${transaction.amount.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
            })}
          </td>
        </tr>
        <tr>
          <th>From:</th>
          <td>TradeMark Investments</td>
          </tr>
          <tr>
          <th>To:</th>
          <td>${user.name.toUpperCase()}</td>
        </tr>
        <tr>
          <th>Status:</th>
          <td>${transaction.status.toUpperCase()}</td>
        </tr>
        <tr>
          <th>Transaction Method:</th>
          <td>${transaction.method}</td>
        </tr>
      </table>

      <ul>
        <li>
          <strong>Current Balance:</strong> ${user.balance.toLocaleString(
            "en-US",
            {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
            }
          )}
        </li>
      </ul>
      <p>
        The privacy and security of your Account details are important to us. If
        you have any concerns or questions, feel free to contact us at
        <a href="mailto:info@tradeMark.com">info@tradeMark.com </a>.
      </p>
      <p>Thank you for choosing TradeMark Investments.</p>
    </div>
  </body>
</html>
`;
    sendMail({
      to: user.email,
      subject: "Withdrawal Approved Transaction",
      html,
    });

    return res.status(200).json({
      message: "Withdrawal approved and earnings deducted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while processing the request." });
  }
});

router.patch("/:id/processing", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(406).json({ message: "Invalid withdrawal ID." });
    }

    const withdrawal = await Withdrawal.findById(toObjectId(id));
    if (!withdrawal || !withdrawal.uid) {
      return res.status(404).json({ message: "Withdrawal not found." });
    }

    const user = await User.findOne({ uid: withdrawal.uid });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const transaction = await Transaction.findById(
      toObjectId(withdrawal.transaction_id)
    );
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    withdrawal.status = "processing";
    transaction.status = "processing";

    await withdrawal.save();
    await transaction.save();

    // Email Notification
    const html = `
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Withdrawal Processing</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #191c24;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #fff;
        color: #191c24;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      h2 {
        color: #010647;
        margin-top: 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
        text-transform: capitalize;
      }
      th {
        background-color: #f2f2f2;
      }
      td {
        background-color: #ffffff;
      }
      ul {
        list-style-type: none;
        padding: 0;
      }
      a {
        color: #007bff;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>TradeMark Investments Electronic Notification</h2>
      <p>We wish to inform you that a Transaction is being processed on your account.</p>
      <h3>Transaction Details</h3>
      <table>
        <tr>
          <th>Transaction ID:</th>
          <td>${transaction.id}</td>
        </tr>
        <tr>
          <th>Transaction Type:</th>
          <td>WITHDRAWAL</td>
        </tr>
        <tr>
          <th>Amount:</th>
          <td>
            ${transaction.amount.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
            })}
          </td>
        </tr>
        <tr>
          <th>From:</th>
          <td>TradeMark Investments</td>
        </tr>
        <tr>
          <th>To:</th>
          <td>${user.name.toUpperCase()}</td>
        </tr>
        <tr>
          <th>Status:</th>
          <td>${transaction.status.toUpperCase()}</td>
        </tr>
        <tr>
          <th>Transaction Method:</th>
          <td>${transaction.method}</td>
        </tr>
      </table>

      <p>Your withdrawal request is now being processed. You will receive a confirmation once the transaction is completed.</p>

      <p>
        If you have any concerns or questions, feel free to contact us at
        <a href="mailto:info@tradeMark.com">info@tradeMark.com</a>.
      </p>

      <p>Thank you for choosing TradeMark Investments.</p>
    </div>
  </body>
</html>
`;

    sendMail({
      to: user.email,
      subject: "Withdrawal Processing Notification",
      html,
    });

    return res.status(200).json({
      message: "Withdrawal status updated to processing, and email sent.",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "An error occurred while processing the request." });
  }
});

router.patch("/:id/decline", async (req, res) => {
  const { id } = req.params;

  if (isValidObjectId(id)) {
    const withdrawal = await Withdrawal.findById(toObjectId(id));
    if (withdrawal && withdrawal.uid) {
      const user = await User.findOne({ uid: withdrawal.uid });
      const transaction = await Transaction.findById(
        toObjectId(withdrawal.transaction_id)
      );

      if (transaction) {
        withdrawal.status = "declined";
        transaction.status = "declined";

        await withdrawal.save();
        await transaction.save();

        const html = `
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title></title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #191c24;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #fff;
        color: #191c24;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      h2 {
        color: #010647;
        margin-top: 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
        text-transform:capitalize;
      }
      th {
        background-color: #f2f2f2;
      }
      td {
        background-color: #ffffff;
      }
      ul {
        list-style-type: none;
        padding: 0;
      }
      a {
        color: #007bff;
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>TradeMark Investments Electronic Notification</h2>
      <p>
        We wish to inform you that a Transaction occurred on your account with
        us.
      </p>
      <h3>Transaction Notification</h3>
      <table>
        <tr>
          <th>Transaction ID:</th>
          <td>${transaction.id}</td>
        </tr>
        <tr>
          <th>Transaction Type:</th>
          <td>WITHDRAWAL</td>
        </tr>
        <tr>
          <th>Amount:</th>
          <td>

            ${transaction.amount.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
            })}
          </td>
        </tr>
        <tr>
          <th>From:</th>
          <td>TradeMark Investments</td>
          </tr>
          <tr>
          <th>To:</th>
          <td>${user.name.toUpperCase()}</td>
        </tr>
        <tr>
          <th>Status:</th>
          <td>${transaction.status.toUpperCase()}</td>
        </tr>
        <tr>
          <th>Transaction Method:</th>
          <td>${transaction.method}</td>
        </tr>
      </table>

      <ul>
        <li>
          <strong>Current Balance:</strong> ${user.balance.toLocaleString(
            "en-US",
            {
              style: "currency",
              currency: "USD",
              minimumFractionDigits: 2,
            }
          )}
        </li>
      </ul>
      <p>
        The privacy and security of your Account details are important to us. If
        you have any concerns or questions, feel free to contact us at
        <a href="mailto:info@tradeMark.com">info@tradeMark.com </a>.
      </p>
      <p>Thank you for choosing TradeMark Investments.</p>
    </div>
  </body>
</html>
`;
        sendMail({
          to: user.email,
          subject: "Withdrawal Declined Transaction",
          html,
        });

        return res.status(200).json({ message: "success" });
      } else {
        return res.status(404).json({ message: "Transaction not found." });
      }
    } else {
      return res.status(404).json({ message: "Withdrawal not found." });
    }
  } else {
    return res.status(406).json({ message: "Invalid withdrawal id." });
  }
});

module.exports = router;
