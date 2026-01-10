const express = require("express");
const Investment = require("../models/investment");
const Transaction = require("../models/transaction");
const User = require("../models/user");
const Plan = require("../models/plan");
const { toObjectId, isValidObjectId } = require("../utils/mongoose_utils");
const { sendMail } = require("../services/mail");

const router = express.Router();

router.get("/all", async (req, res) => {
  /**
    #swagger.responses[200] = {
        schema:  { $ref: "#/components/schemas/InvestmentsResponse" }
    }
    #swagger.responses[401] = {
        schema: { $ref: '#/definitions/InvalidToken' }
    }
    */
  const { uid } = req.user;
  const investments = await Investment.find({ uid });
  const data = [];

  const user = await User.findOne({ uid });

  investments.forEach((investment) =>
    data.push({
      id: investment.id,
      uid: investment.uid,
      name: user.name,
      email: user.email,
      plan_name: investment.plan_name,
      method: investment.method,
      plan_id: investment.plan_id,
      duration: investment.duration,
      amount: investment.amount,
      returns: investment.returns,
      status: investment.status,
      createdAt: investment.createdAt.getTime(),
      updatedAt: investment.updatedAt.getTime(),
    })
  );

  return res.status(200).json({ message: "success", data });
});

router.get("/:id", async (req, res) => {
  /**
    #swagger.responses[200] = {
        schema:  { $ref: "#/components/schemas/InvestmentResponse" }
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
    const investment = await Investment.findOne({ uid, _id: toObjectId(id) });
    if (investment) {
      const user = await User.findOne({ uid });

      const data = {
        id: investment.id,
        uid: investment.uid,
        name: user.name,
        email: user.email,
        plan_name: investment.plan_name,
        method: investment.method,
        plan_id: investment.plan_id,
        duration: investment.duration,
        amount: investment.amount,
        returns: investment.returns,
        status: investment.status,
        createdAt: investment.createdAt.getTime(),
        updatedAt: investment.updatedAt.getTime(),
      };

      return res.status(200).json({ message: "success", data });
    } else {
      return res.status(404).json({ message: "Investment not found." });
    }
  } else {
    return res.status(406).json({ message: "Invalid investment id." });
  }
});

router.post("/", async (req, res) => {
  /**
     #swagger.requestBody = {
        required: true,
        schema: { $ref: "#/components/schemas/InvestmentRequest" }
    }
    #swagger.responses[200] = {
        schema:  { $ref: "#/components/schemas/InvestmentResponse" }
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
  const { plan_id, amount, method } = req.body;

  const amountNumber = parseFloat(amount);

  if (!(plan_id && amountNumber && amountNumber > 0)) {
    return res.status(400).json({
      message: "Bad Request `plan_id` and `amount` and `method` are required.",
    });
  }

  let investmentPlan;

  if (isValidObjectId(plan_id)) {
    investmentPlan = await Plan.findById(toObjectId(plan_id));
    if (!investmentPlan)
      return res.status(404).json({ message: "Investment Plan not found." });
  } else return res.status(400).json({ message: "Invalid plan_id" });

  const user = await User.findOne({ uid });

  if (!user) return res.status(404).json({ message: "User does not exists." });

  if (user.balance < amountNumber)
    return res
      .status(406)
      .json({ message: "User does not have sufficient balance." });

  const validMethods = ["BTC", "ETH", "SOL"];
  if (!validMethods.includes(method)) {
    return res.status(400).json({ message: "Invalid deposit method." });
  }

  switch (method) {
    case "BTC":
      if (user.btcBal < amountNumber) {
        return res
          .status(406)
          .json({ message: "User does not have sufficient balance." });
      }
      user.btcBal -= amountNumber;
      break;
    case "ETH":
      if (user.ethBal < amountNumber) {
        return res
          .status(406)
          .json({ message: "User does not have sufficient balance." });
      }
      user.ethBal -= amountNumber;
      break;
    case "SOL":
      if (user.solBal < amountNumber) {
        return res
          .status(406)
          .json({ message: "User does not have sufficient balance." });
      }
      user.solBal -= amountNumber;
      break;
    case "USDT":
      if (user.usdtBal < amountNumber) {
        return res
          .status(406)
          .json({ message: "User does not have sufficient balance." });
      }
      user.usdtBal -= amountNumber;
      break;
  }

  const investment = await Investment.create({
    uid,
    name: user.name,
    email: user.email,
    plan_id,
    plan_name: investmentPlan.name,
    method,
    duration: investmentPlan.duration,
    amount: amountNumber,
    returns: investmentPlan.returns,
  });

  await Transaction.create({
    uid,
    amount: amountNumber,
    from: uid,
    to: "admin",
    method: "transfer",
    status: "pending",
    type: "investment",
  });

  const html = `
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Investment Notification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #191c24;
        margin: 0;
        padding: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        padding: 20px;
      }
      h2 {
        color: #0056b3;
        margin-top: 0;
      }
      p {
        color: #333333;
        line-height: 1.6;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th,
      td {
        padding: 10px;
        text-align: left;
        border-bottom: 1px solid #dddddd;
        text-transform: capitalize;
      }
      th {
        background-color: #f2f2f2;
      }
      tr:last-child td {
        border-bottom: none;
      }
      .footer {
        margin-top: 20px;
        text-align: center;
        color: #666666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Investment Notification</h2>
      <p>Hello ${user.name.split(" ")[0]},</p>
      <p>
        We would like to inform you about the recent investment transaction made
        on your account.
      </p>

      <h3>Transaction Details:</h3>
      <table>
        <tr>
          <th>Investment ID:</th>
          <td>${investment.id}</td>
        </tr>
        <tr>
          <th>Plan Name:</th>
          <td>${investment.plan_name.toUpperCase()}</td>
        </tr>
        <tr>
          <th>Amount Invested:</th>
          <td>
            ${investment.amount.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </td>
        </tr>
        <tr>
          <th>Duration:</th>
          <td>${investment.duration} days</td>
        </tr>
        <tr>
          <th>Status:</th>
          <td>${investment.status.toUpperCase()}</td>
        </tr>
        <tr>
          <th>Transaction Date:</th>
          <td>${new Date(investment.createdAt).toLocaleDateString("en-GB")}</td>
        </tr>
      </table>

      <p>
        If you have any questions or concerns, feel free to contact us
        <a href="mailto:info@blockinv.com">info@blockinv.com</a>.
        Thank you for choosing our service.
      </p>

      <div class="footer">
        <p>Best regards,<br />TradeMark Investments</p>
      </div>
    </div>
  </body>
</html>
  `;
  sendMail({
    to: user.email,
    subject: "Investment",
    html,
  });

  const data = {
    id: investment.id,
    uid,
    plan_id: investment.plan_id,
    plan_name: investment.plan_name,
    method,
    amount: investment.amount,
    returns: investment.returns,
    duration: investment.duration,
    status: investment.status,
    createdAt: investment.createdAt.getTime(),
    updatedAt: investment.updatedAt.getTime(),
  };

  return res.status(200).json({ message: "success", data });
});

module.exports = router;
