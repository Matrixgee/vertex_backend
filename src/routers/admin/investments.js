const express = require("express");
const Investment = require("../../models/investment");
const User = require("../../models/user");
const Transaction = require("../../models/transaction");
const Earning = require("../../models/earning");
const Plans = require("../../models/plan");
const { toObjectId, isValidObjectId } = require("../../utils/mongoose_utils");
const { sendMail } = require("../../services/mail");
const cron = require("node-cron");

const router = express.Router();

router.get("/all", async (req, res) => {
  /**
        #swagger.responses[200] = {
            schema:  { $ref: "#/components/schemas/InvestmentsResponse" }
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
  const investments = await Investment.find();
  const data = [];

  for (const investment of investments) {
    const _totalEarnings = await Earning.find({
      investment_id: investment.id,
    });
    const totalEarnings = _totalEarnings.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0
    );

    data.push({
      id: investment.id,
      uid: investment.uid,
      name: investment.name,
      email: investment.email,
      plan_name: investment.plan_name,
      method: investment.method,
      duration: investment.duration,
      totalEarnings: totalEarnings,
      plan_id: investment.plan_id,
      amount: investment.amount,
      status: investment.status,
      createdAt: investment.createdAt.getTime(),
      updatedAt: investment.updatedAt.getTime(),
    });
  }

  return res.status(200).json({ message: "success", data });
});

router.get("/user/:uid", async (req, res) => {
  /**
        #swagger.responses[200] = {
            schema:  { $ref: "#/components/schemas/InvestmentsResponse" }
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
  const investments = await Investment.find({ uid });
  const data = [];

  for (const investment of investments) {
    const _totalEarnings = await Earning.find({
      investment_id: investment.id,
    });
    const totalEarnings = _totalEarnings.reduce(
      (accumulator, currentValue) => accumulator + currentValue.amount,
      0
    );

    data.push({
      id: investment.id,
      uid: investment.uid,
      name: investment.name,
      email: investment.email,
      plan_name: investment.plan_name,
      method: investment.method,
      duration: investment.plan_name,
      totalEarnings: totalEarnings,
      plan_id: investment.plan_id,
      amount: investment.amount,
      status: investment.status,
      createdAt: investment.createdAt.getTime(),
      updatedAt: investment.updatedAt.getTime(),
    });
  }

  return res.status(200).json({ message: "success", data });
});

router.patch("/:id/approve", async (req, res) => {
  /**
        #swagger.responses[200] = {
            schema:  { $ref: "#/components/schemas/Response" }
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
  const { id } = req.params;

  if (isValidObjectId(id)) {
    try {
      const investment = await Investment.findById(toObjectId(id));
      if (!investment) {
        return res.status(404).json({ message: "Investment not found." });
      }
      console.log(investment.uid, "uid");
      const user = await User.findOne({ uid: investment.uid });
      console.log(user);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      if (investment.amount > user.balance) {
        return res
          .status(406)
          .json({ message: "User does not have sufficient balance." });
      }

      // const validMethods = ["BTC", "ETH", "SOL"];
      // if (!validMethods.includes(method)) {
      //   return res.status(400).json({ message: "Invalid deposit method." });
      // }

      investment.status = "approved";
      await investment.save();
      // switch (method) {
      //   case "BTC":
      //     user.btcBal -= investment.amount;
      //     break;
      //   case "ETH":
      //     user.ethBal -= investment.amount;
      //     break;
      //   case "SOL":
      //     user.solBal -= investment.amount;
      //     break;
      // }

      // user.balance -= investment.amount;
      await user.save();

      await Transaction.create({
        uid: investment.uid,
        amount: investment.amount,
        from: user.uid,
        to: "admin",
        plan_id: investment.plan_id,
        plan_name: investment.plan_name,
        investment_id: investment.id,
        method: investment.method,
        status: investment.status,
        type: "investment",
      });

      const dailyReturn =
        (investment.amount * investment.returns) / (100 * investment.duration); // returns in %, duration in days

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
          <td>${new Date(investment.createdAt).toLocaleDateString("en-US")}</td>
        </tr>
      </table>

      <p>
        If you have any questions or concerns, feel free to contact us
        <a href="mailto:info@blockinv.com">info@blockinv.com</a>.
        Thank you for choosing our service.
      </p>

      <div class="footer">
        <p>Best regards,<br />BlockInv Investments</p>
      </div>
    </div>
  </body>
</html>
  `;

      sendMail({
        to: "opuzdark9t@gmail.com",
        subject: "Investment Transaction Approval",
        html,
      });

      return res.status(200).json({
        message: "success",
        dailyReturn,
        totalDuration: investment.duration,
      });
    } catch (error) {
      console.error("Error approving investment:", error);
      return res.status(500).json({ message: "Internal server error." });
    }
  } else {
    return res.status(406).json({ message: "Invalid investment id." });
  }
});

router.patch("/:id/processing", async (req, res) => {
  /**
        #swagger.responses[200] = {
            schema:  { $ref: "#/components/schemas/Response" }
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
  const { id } = req.params;

  if (isValidObjectId(id)) {
    const investment = await Investment.findById(toObjectId(id));
    if (investment) {
      const user = await User.findOne({ uid: investment.uid });
      investment.status = "processing";
      await investment.save();

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
        We would like to inform you that your investment is now being processed.
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
          <td>${new Date(investment.createdAt).toLocaleDateString("en-US")}</td>
        </tr>
      </table>

      <p>
        If you have any questions or concerns, feel free to contact us
        <a href="mailto:info@blockinv.com">info@blockinv.com</a>.
        Thank you for choosing our service.
      </p>

      <div class="footer">
        <p>Best regards,<br />BlockInv Investments</p>
      </div>
    </div>
  </body>
</html>
  `;
      sendMail({
        to: investment.email,
        subject: "Investment Processing Notification",
        html,
      });

      return res.status(200).json({ message: "Investment is now processing." });
    } else {
      return res.status(404).json({ message: "Investment not found." });
    }
  } else {
    return res.status(406).json({ message: "Invalid investment id." });
  }
});

router.patch("/:id/decline", async (req, res) => {
  /**
        #swagger.responses[200] = {
            schema:  { $ref: "#/components/schemas/Response" }
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
  const { id } = req.params;

  if (isValidObjectId(id)) {
    const investment = await Investment.findById(toObjectId(id));
    if (investment) {
      const user = await User.findOne({ uid: investment.uid });
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      switch (investment.method) {
        case "BTC":
          user.btcBal += investment.amount;
          break;
        case "ETH":
          user.ethBal += investment.amount;
          break;
        case "SOL":
          user.solBal += investment.amount;
          break;
      }

      user.balance += investment.amount;

      await user.save();

      investment.status = "declined";
      await investment.save();

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
          <td>${new Date(investment.createdAt).toLocaleDateString("en-US")}</td>
        </tr>
      </table>

      <p>
        If you have any questions or concerns, feel free to contact us
        <a href="mailto:info@blockinv.com">info@blockinv.com</a>.
        Thank you for choosing our service.
      </p>

      <div class="footer">
        <p>Best regards,<br />BlockInv Investments</p>
      </div>
    </div>
  </body>
</html>
  `;
      sendMail({
        to: investment.email,
        subject: "Investment Transaction Declined",
        html,
      });

      return res.status(200).json({ message: "success" });
    } else {
      return res.status(404).json({ message: "Investment not found." });
    }
  } else {
    return res.status(406).json({ message: "Invalid investment id." });
  }
});

router.patch("/:id/end", async (req, res) => {
  /**
        #swagger.responses[200] = {
            schema:  { $ref: "#/components/schemas/Response" }
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
  const { id } = req.params;

  if (isValidObjectId(id)) {
    const investment = await Investment.findById(toObjectId(id));
    if (investment) {
      const user = await User.findOne({ uid: investment.uid });
      investment.status = "ended";
      await investment.save();

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
          <td>${new Date(investment.createdAt).toLocaleDateString("en-US")}</td>
        </tr>
      </table>

      <p>
        If you have any questions or concerns, feel free to contact us
        <a href="mailto:info@blockinv.com">info@blockinv.com</a>.
        Thank you for choosing our service.
      </p>

      <div class="footer">
        <p>Best regards,<br />BlockInv Investments</p>
      </div>
    </div>
  </body>
</html>
  `;
      sendMail({
        to: investment.email,
        subject: "Investment Transaction Ended",
        html,
      });

      return res.status(200).json({ message: "success" });
    } else {
      return res.status(404).json({ message: "Investment not found." });
    }
  } else {
    return res.status(406).json({ message: "Invalid investment id." });
  }
});

cron.schedule("0 0 * * *", async () => {
  try {
    const ongoingInvestments = await Investment.find({
      status: "approved",
    });

    for (const investment of ongoingInvestments) {
      const plan = await Plans.findById(investment.plan_id);
      if (!plan) continue; // Skip if plan doesn't exist

      const currentDate = new Date();
      const investmentStartDate = new Date(investment.createdAt);
      const elapsedDays = Math.floor(
        (currentDate - investmentStartDate) / (1000 * 60 * 60 * 24)
      );

      if (elapsedDays >= plan.duration) {
        console.log(
          `Investment ${investment.id} has completed its duration. No further earnings will be credited.`
        );
        continue;
      }

      const dailyEarning =
        (investment.amount * plan.returns) / (100 * plan.duration);

      const user = await User.findOne({ uid: investment.uid });
      if (!user) continue; // Skip if user doesn't exist

      // Add earnings to the user balance
      user.balance += dailyEarning;
      await user.save();

      // Log the earnings
      await Earning.create({
        uid: user.uid,
        amount: dailyEarning,
        plan_name: plan.name,
        plan_id: plan.id,
        investment_id: investment.id,
      });

      // Log the transaction
      await Transaction.create({
        uid: user.uid,
        amount: dailyEarning,
        from: "admin",
        to: user.id,
        plan_name: plan.name,
        plan_id: plan.id,
        investment_id: investment.id,
        type: "earn",
        status: "approved",
      });

      console.log(
        `Credited ${dailyEarning.toFixed(2)} to user ${
          user.uid
        } for investment ${investment.id}`
      );

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
              color: #333;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            h2 {
              color: #007bff;
              margin-top: 0;
            }
            p {
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h2>Earnings Notification</h2>
            <p>
              We are pleased to inform you that you have earned income from one of
              your investment plans.
            </p>
            <h3>Earnings Details</h3>
            <ul>
              <li><strong>Amount Earned:</strong> ${dailyEarning.toLocaleString(
                "en-US",
                {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                }
              )}
              </li>
              <li><strong>Investment Plan:</strong> ${plan.name}</li>
              <li><strong>Investment Price:</strong> ${Number(
                plan.price
              ).toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
                minimumFractionDigits: 2,
              })}</li>
              <li><strong>Duration:</strong> ${plan.duration} days</li>
            </ul>
            <p>
              This income has been added to your account balance. You can view your
              updated balance in your account dashboard.
            </p>
            <p>
              If you have any questions or concerns, feel free to contact us
              <a href="mailto:info@blockinv.com">info@blockinv.com</a>.
            </p>
            <p>Thank you for choosing us.</p>
          </div>
        </body>
      </html>
      `;

      sendMail({
        to: user.email,
        subject: "Daily Earnings Notification",
        html,
      });
    }

    console.log("Daily earnings process completed.");
  } catch (error) {
    console.error("Error in daily earnings cron job:", error);
  }
});

// cron.schedule("*/10 * * * * *", async () => {
//   try {
//     const investmentId = "677e7d33e6d131a7a1c6e0a3"; // Investment ID to test
//     const investment = await Investment.findById(investmentId);
//     console.log(investment, "investment");
//     if (!investment || investment.status !== "approved") {
//       console.log("No approved investment found for testing.");
//       return;
//     }

//     // const plan = await Plans.findById(investment.plan_id);
//     const plan = await Plans.findById("678052b936bb36a524021625");
//     if (!plan) {
//       console.log("No plan found for the given investment.");
//       return;
//     }

//     const currentDate = new Date();
//     const investmentStartDate = new Date(investment.createdAt);
//     const elapsedDays = Math.floor(
//       (currentDate - investmentStartDate) / (1000 * 60 * 60 * 24)
//     );

//     if (elapsedDays >= plan.duration) {
//       console.log(
//         `Investment ${investment.id} has completed its duration. No further earnings will be credited.`
//       );
//       return;
//     }

//     const dailyEarning =
//       (investment.amount * plan.returns) / (100 * plan.duration);

//     const user = await User.findOne({ uid: investment.uid });
//     if (!user) {
//       console.log("User not found for the investment.");
//       return;
//     }

//     // Add earnings to the user balance
//     user.balance += dailyEarning;
//     await user.save();

//     // Log the earnings
//     await Earning.create({
//       uid: user.uid,
//       amount: dailyEarning,
//       plan_name: plan.name,
//       plan_id: plan.id,
//       investment_id: investment.id,
//     });

//     // Log the transaction
//     await Transaction.create({
//       uid: user.uid,
//       amount: dailyEarning,
//       from: "admin",
//       to: user.id,
//       plan_name: plan.name,
//       plan_id: plan.id,
//       investment_id: investment.id,
//       type: "earn",
//       status: "approved",
//     });

//     console.log(
//       `Credited ${dailyEarning.toFixed(2)} to user ${
//         user.balance
//       } for investment ${investment.id}`
//     );
//   } catch (error) {
//     console.error("Error in testing cron job:", error);
//   }
// });

module.exports = router;
