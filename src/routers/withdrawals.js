const express = require("express");
const Withdrawal = require("../models/withdrawal");
const Transaction = require("../models/transaction");
const User = require("../models/user");
const { toObjectId, isValidObjectId } = require("../utils/mongoose_utils");
const { sendMail } = require("../services/mail");

const router = express.Router();

router.get("/all", async (req, res) => {
  /**
      #swagger.responses[200] = {
          schema:  { $ref: "#/components/schemas/WithdrawalsResponse" }
      }
      #swagger.responses[401] = {
          schema: { $ref: '#/definitions/InvalidToken' }
      }
    */
  const { uid } = req.user;
  const withdrawals = await Withdrawal.find({ uid });
  const data = [];

  withdrawals.forEach((withdrawal) =>
    data.push({
      id: withdrawal.id,
      uid: withdrawal.uid,
      amount: withdrawal.amount,
      to: withdrawal.to,
      method: withdrawal.method,
      transaction_id: withdrawal.transaction_id,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt.getTime(),
      updatedAt: withdrawal.updatedAt.getTime(),
    })
  );

  return res.status(200).json({ message: "success", data });
});

router.get("/:id", async (req, res) => {
  /**
      #swagger.responses[200] = {
          schema:  { $ref: "#/components/schemas/WithdrawalResponse" }
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
  const { uid } = req.user;
  const { id } = req.params;

  if (isValidObjectId(id)) {
    const withdrawal = await Withdrawal.findOne({ uid, _id: toObjectId(id) });
    if (withdrawal) {
      const data = {
        id: withdrawal.id,
        uid: withdrawal.uid,
        amount: withdrawal.amount,
        to: withdrawal.to,
        method: withdrawal.method,
        transaction_id: withdrawal.transaction_id,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt.getTime(),
        updatedAt: withdrawal.updatedAt.getTime(),
      };

      return res.status(200).json({ message: "success", data });
    } else {
      return res.status(404).json({ message: "Withdrawal not found." });
    }
  } else {
    return res.status(406).json({ message: "Invalid withdrawal id." });
  }
});

router.post("/", async (req, res) => {
  /**
       #swagger.requestBody = {
          required: true,
          schema: { $ref: "#/components/schemas/WithdrawalRequest" }
      }
      #swagger.responses[200] = {
          schema:  { $ref: "#/components/schemas/WithdrawalResponse" }
      }
      #swagger.responses[400] = {
          schema: { $ref: '#/definitions/BadRequest' }
      }
      #swagger.responses[401] = {
          schema: { $ref: '#/definitions/InvalidToken' }
      }
      #swagger.responses[404] = {
          schema: { $ref: '#/definitions/NotExists' }
      }
      #swagger.responses[406] = {
          schema: { $ref: '#/definitions/InsufficientBalance' }
      }
    */

  const { uid } = req.user;
  const {
    amount,
    to,
    method,
    emailAddress,
    walletAddress,
    bankName,
    bankAccount,
    accountName,
    routingNumber,
  } = req.body;

  const amountNumber = parseFloat(amount);

  // if (!(to && method && amountNumber && amountNumber > 0)) {
  //   return res.status(400).json({
  //     message: "Bad Request `to`, `method`, and `amount` are required.",
  //   });
  // }

  const user = await User.findOne({ uid });

  if (!user) return res.status(404).json({ message: "User does not exists." });

  if (user.balance < amountNumber) {
    return res
      .status(406)
      .json({ message: "User does not have sufficient balance." });
  }

  const transaction = await Transaction.create({
    uid,
    amount: amountNumber || "",
    from: uid || "",
    to: to || "",
    method: method || "",
    emailAddress: emailAddress || "",
    walletAddress: walletAddress || "",
    bankName: bankName || "",
    bankAccount: bankAccount || "",
    accountName: accountName || "",
    routingNumber: routingNumber || "",
    status: "pending",
    type: "withdrawal",
  });

  const withdrawal = await Withdrawal.create({
    uid: transaction.uid,
    amount: transaction.amount,
    to: transaction.to,
    transaction_id: transaction.id,
    method: transaction.method,
    emailAddress: emailAddress || "",
    walletAddress: walletAddress || "",
    bankName: bankName || "",
    bankAccount: bankAccount || "",
    accountName: accountName || "",
    routingNumber: routingNumber || "",
  });

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
        <a href="mailto:info@blockinv.com">info@blockinv.com </a>.
      </p>
      <p>Thank you for choosing TradeMark Investments.</p>
    </div>
  </body>
</html>
`;

  sendMail({
    to: user.email,
    subject: "Withdrawal Transaction Notification",
    html,
  });

  const data = {
    id: withdrawal.id,
    uid: withdrawal.uid,
    amount: withdrawal.amount,
    to: withdrawal.to,
    method: withdrawal.method,
    transaction_id: withdrawal.transaction_id,
    status: withdrawal.status,
    createdAt: withdrawal.createdAt.getTime(),
    updatedAt: withdrawal.updatedAt.getTime(),
  };

  return res.status(200).json({ message: "success", data });
});

module.exports = router;
