const express = require("express");
const Deposit = require("../models/deposit");
const Transaction = require("../models/transaction");
const User = require("../models/user");
const { toObjectId, isValidObjectId } = require("../utils/mongoose_utils");
const { sendMail } = require("../services/mail");

const router = express.Router();

router.get("/all", async (req, res) => {
  /**
      #swagger.responses[200] = {
          schema:  { $ref: "#/components/schemas/DepositsResponse" }
      }
      #swagger.responses[401] = {
          schema: { $ref: '#/definitions/InvalidToken' }
      }
    */
  const { uid } = req.user;
  const deposits = await Deposit.find({ uid });
  const data = [];

  deposits.forEach((deposit) =>
    data.push({
      id: deposit.id,
      uid: deposit.uid,
      amount: deposit.amount,
      from: deposit.from,
      to: deposit.to,
      method: deposit.method,
      status: deposit.status,
      createdAt: deposit.createdAt.getTime(),
      updatedAt: deposit.updatedAt.getTime(),
    })
  );

  return res.status(200).json({ message: "success", data });
});

router.get("/:id", async (req, res) => {
  /**
      #swagger.responses[200] = {
          schema:  { $ref: "#/components/schemas/DepositResponse" }
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
    const deposit = await Deposit.findOne({ uid, _id: toObjectId(id) });
    if (deposit) {
      const data = {
        id: deposit.id,
        uid: deposit.uid,
        from: deposit.from,
        to: deposit.to,
        amount: deposit.amount,
        status: deposit.status,
        createdAt: deposit.createdAt.getTime(),
        updatedAt: deposit.updatedAt.getTime(),
      };

      return res.status(200).json({ message: "success", data });
    } else {
      return res.status(404).json({ message: "Deposit not found." });
    }
  } else {
    return res.status(406).json({ message: "Invalid deposit id." });
  }
});

router.post("/", async (req, res) => {
  /**
       #swagger.requestBody = {
          required: true,
          schema: { $ref: "#/components/schemas/DepositRequest" }
      }
      #swagger.responses[200] = {
          schema:  { $ref: "#/components/schemas/DepositResponse" }
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
  const { amount, method, from } = req.body;

  const amountNumber = parseFloat(amount);

  if (!(method && amountNumber && amountNumber > 0 && from)) {
    return res.status(400).json({
      message: "Bad Request , `method`, `amount`, and `from` are required.",
    });
  }

  const validMethods = ["BTC", "SOL", "ETH"];
  if (!validMethods.includes(method)) {
    return res.status(400).json({
      message: `Invalid payment method. Allowed methods are: ${validMethods.join(
        ", "
      )}.`,
    });
  }

  const user = await User.findOne({ uid });

  if (!user) return res.status(404).json({ message: "User does not exists." });

  const transaction = await Transaction.create({
    uid,
    amount: amountNumber,
    from,
    to: "Admin",
    method,
    status: "pending",
    type: "deposit",
  });

  const deposit = await Deposit.create({
    uid: transaction.uid,
    amount: transaction.amount,
    from: transaction.from,
    to: transaction.to,
    transaction_id: transaction.id,
    method: transaction.method,
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
          <td>DEPOSIT</td>
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
          <td>${transaction.from}</td>
        </tr>
        <tr>
          <th>To:</th>
          <td>TradeMark Investments</td>
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

  sendMail({ to: user.email, subject: "Transaction Notification", html });

  const data = {
    id: deposit.id,
    uid,
    amount: deposit.amount,
    from: deposit.from,
    to: deposit.to,
    method: deposit.method,
    status: deposit.status,
    createdAt: deposit.createdAt.getTime(),
    updatedAt: deposit.updatedAt.getTime(),
  };

  return res.status(200).json({ message: "success", data });
});

module.exports = router;
