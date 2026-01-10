const express = require("express");
const User = require("../models/user");
const Investment = require("../models/investment");
const Deposit = require("../models/deposit");
const Withdrawal = require("../models/withdrawal");
const Earning = require("../models/earning");
const { generateUniqueID, generateOTP } = require("../services/generator");
const { jwtSign, jwtVerify } = require("../services/jwt");
const {
  sendOTPByEmail,
  sendEmailVerified,
  sendResetPasswordLink,
  sendMail,
} = require("../services/mail");

const router = express.Router();

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

router.post("/register-admin", async (req, res) => {
  const { email, password } = req.body;

  if (!(email && isValidEmail(email) && password)) {
    return res.status(400).json({
      message: "Bad Request `email`, `password` are required.",
    });
  }

  let user = await User.findOne({ email, type: "admin" });

  if (user) {
    return res.status(409).json({ message: "Email already exists." });
  } else {
    user = await User.create({
      email,
      username: "admin",
      password,
      uid: generateUniqueID(),
      type: "admin",
    });

    const token = jwtSign({
      uid: user.uid,
      type: user.type,
    });

    return res.status(200).json({
      message: "success",
      token,
      data: {
        user: {
          username: user.username,
          uid: user.uid,
          createdAt: user.createdAt.getTime(),
        },
      },
    });
  }
});

router.post("/register", async (req, res) => {
  /**
     #swagger.requestBody = {
        required: true,
        schema: { $ref: "#/components/schemas/RegisterRequest" }
    }

    #swagger.responses[200] = {
        schema:  { $ref: "#/components/schemas/LoginResponse" }
    }
    #swagger.responses[400] = {
        schema: { $ref: '#/definitions/BadRequest' }
    }
    #swagger.responses[401] = {
        schema: { $ref: '#/definitions/InvalidToken' }
    }
    #swagger.responses[409] = {
        schema: { $ref: '#/definitions/Conflict' }
    }
    */
  const { name, username, email, password, referralId, phoneNumber } = req.body;

  if (!(name && username && email && isValidEmail(email) && password)) {
    return res.status(400).json({
      message:
        "Bad Request `name`, `username`, `email`, `password` are required.",
    });
  }

  let user = await User.findOne({ $or: [{ username }, { email }] });

  if (user) {
    if (username == user.username) {
      return res.status(409).json({ message: "Username already exists." });
    } else if (email == user.email) {
      return res.status(409).json({ message: "Email already exists." });
    }
  } else {
    user = await User.create({
      name,
      username,
      email,
      password,
      referralId,
      uid: generateUniqueID(),
      phoneNumber,
    });

    const otp = generateOTP();

    const token = jwtSign({
      uid: user.uid,
      type: user.type,
    });

    const otpToken = jwtSign({ otp, email }, "1h");

    sendOTPByEmail({ email, otp, token: otpToken, name });

    return res.status(200).json({
      message: "success",
      token,
      data: {
        user: {
          name: user.name,
          username: user.username,
          uid: user.uid,
          email: user.email,
          balance: user.balance,
          activeInvestments: 0,
          pendingWithdrawals: 0,
          earnings: 0,
          verified: user.verified,
          referralId: user.referralId,
          bitcoin: user.bitcoin,
          sol: user.sol,
          ethereum: user.ethereum,
          type: user.type,
          createdAt: user.createdAt.getTime(),
        },
      },
    });
  }
});

router.post("/verify-email", async (req, res) => {
  /**
     #swagger.requestBody = {
        required: true,
        schema: { $ref: "#/components/schemas/VerifyRequest" }
    }

    #swagger.responses[200] = {
        schema:  { $ref: "#/components/schemas/Response" }
    }
    #swagger.responses[400] = {
        schema: { $ref: '#/definitions/BadRequest' }
    }
    #swagger.responses[401] = {
        schema: { $ref: '#/definitions/InvalidToken' }
    }
    #swagger.responses[409] = {
        schema: { $ref: '#/definitions/Conflict' }
    }
    */
  const { token, otp } = req.body;

  if (!(otp && token)) {
    return res.status(400).json({
      message: "Bad Request `otp`, `token` are required.",
    });
  }

  jwtVerify(token, async (error, decoded) => {
    if (error) {
      return res.status(401).json({ message: "Invalid token", error });
    }

    const { email } = decoded;

    if (otp != req.body.otp) {
      return res.status(406).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ email });
    if (user) {
      user.verified = true;
      await user.save();

      sendEmailVerified({ email, name: user.name });

      return res.status(200).json({ message: "Verified successfully." });
    } else {
      return res
        .status(404)
        .json({ message: `User with email '${email}' not found.` });
    }
  });
});

router.post("/resend-verification", async (req, res) => {
  /**
     #swagger.requestBody = {
        required: true,
        schema: { $ref: "#/components/schemas/ResendVerificationRequest" }
    }

    #swagger.responses[200] = {
        schema:  { $ref: "#/components/schemas/ResendVerificationResponse" }
    }
    #swagger.responses[400] = {
        schema: { $ref: '#/definitions/BadRequest' }
    }
    #swagger.responses[404] = {
        schema: { $ref: '#/definitions/NotFound' }
    }
  */

  const { email } = req.body;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      message: "Bad Request `email` is required and must be valid.",
    });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  if (user.verified) {
    return res.status(400).json({ message: "User is already verified." });
  }

  const otp = generateOTP();
  const otpToken = jwtSign({ otp, email }, "1h");

  sendOTPByEmail({ email, otp, token: otpToken, name: user.name });

  return res.status(200).json({
    message: "Verification email sent successfully.",
  });
});

router.post("/login", async (req, res) => {
  /**
     #swagger.requestBody = {
        required: true,
        schema: { $ref: "#/components/schemas/LoginRequest" }
    }
    #swagger.responses[200] = {
        schema:  { $ref: "#/components/schemas/LoginResponse" }
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
    */
  const { email, password } = req.body;

  if (!(email && isValidEmail(email) && password)) {
    return res.status(400).json({
      message: "Email and Password required.",
    });
  }

  const user = await User.findOne({ email });

  if (user) {
    if (password == user.password) {
      const token = jwtSign({
        uid: user.uid,
        type: user.type,
      });

      if (user.type === "admin") {
        return res.status(200).json({
          message: "success",
          token,
          data: {
            user: user,
          },
        });
      } else {
        // if (!user.verified) {
        //   return res.status(406).json({ message: "Kindly Verify your Email" });
        // }
        //         sendMail({
        //           to: user.email,
        //           subject: "Account Login Notification",
        //           html: `
        // <html lang="en">
        //   <head>
        //     <meta charset="UTF-8" />
        //     <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        //     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        //     <title>Login Notification</title>
        //     <style>
        //       body {
        //         font-family: Arial, sans-serif;
        //         line-height: 1.6;
        //         margin: 0;
        //         padding: 0;
        //         background-color: #191c24;
        //       }
        //       .container {
        //         max-width: 600px;
        //         margin: 2rem auto;
        //         padding: 20px;
        //         background-color: #fff;
        //         color: #191c24;
        //         border-radius: 10px;
        //         box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        //       }
        //       h2 {
        //         color: #333;
        //       }
        //       p {
        //         color: #666;
        //       }
        //       .details {
        //         margin-top: 20px;
        //       }
        //       .details table {
        //         width: 100%;
        //         border-collapse: collapse;
        //         margin-top: 10px;
        //       }
        //       .details th,
        //       .details td {
        //         padding: 8px;
        //         text-align: left;
        //         border-bottom: 1px solid #ddd;
        //         text-transform: capitalize;
        //       }
        //       .details th {
        //         background-color: #f2f2f2;
        //       }
        //       .footer {
        //         margin-top: 20px;
        //         text-align: center;
        //       }
        //       .footer p {
        //         color: #999;
        //         font-size: 12px;
        //       }
        //     </style>
        //   </head>
        //   <body>
        //     <div class="container">
        //       <h2>Account Login Notification</h2>
        //       <p>Dear ${user.name.split(" ")[0]},</p>
        //       <p>We wanted to inform you that your account was recently accessed.</p>
        //       <div class="details">
        //         <table>
        //           <tr>
        //             <th>Account Name:</th>
        //             <td>${user.name}</td>
        //           </tr>
        //           <tr>
        //             <th>Balance:</th>
        //             <td>${new Intl.NumberFormat("en-US", {
        //               style: "currency",
        //               currency: "USD",
        //             }).format(user.balance)}</td>
        //           </tr>
        //           <tr>
        //             <th>Verified:</th>
        //             <td style="text-transform: capitalize;">${user.verified}</td>
        //           </tr>
        //         </table>
        //       </div>
        //       <p>
        //         If this login was not authorized by you, please contact our support team
        //         immediately at
        //         <a href="mailto:info@blockinv.com"> info@blockinv.com </a>
        //       </p>
        //       <p>
        //         If you have any concerns or questions, feel free to reach out to us.
        //       </p>
        //       <div class="footer">
        //         <p>Best regards,<br />TradeMark Investments</p>
        //       </div>
        //     </div>
        //   </body>
        // </html>
        // `,
        //         });
      }

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
        token,
        data: {
          user: {
            user,
            activeInvestments: activeInvestments,
            pendingWithdrawals: pendingWithdrawals,
            totalWithdrawals: totalWithdrawals,
            totalDeposits: totalDeposits,
            earnings: earnings,
          },
        },
      });
    } else {
      return res.status(401).json({ message: "Invalid Password." });
    }
  } else {
    return res.status(404).json({ message: "User does not exist." });
  }
});

router.post("/forgot-password", async (req, res) => {
  /**
     #swagger.requestBody = {
        required: true,
        schema: { $ref: "#/components/schemas/ForgotPasswordRequest" }
    }

    #swagger.responses[200] = {
        schema:  { $ref: "#/components/schemas/Response" }
    }
    #swagger.responses[400] = {
        schema: { $ref: '#/definitions/BadRequest' }
    }
    #swagger.responses[401] = {
        schema: { $ref: '#/definitions/InvalidToken' }
    }
    #swagger.responses[409] = {
        schema: { $ref: '#/definitions/Conflict' }
    }
    */
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Bad Request `email` is required.",
    });
  }
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "User not found" });

  const otp = generateOTP();

  const token = jwtSign({ otp, email }, "5m");

  try {
    sendResetPasswordLink({ email, otp, token, name: user.name });

    return res.status(201).json({
      message: "Your account password reset link has been sent to your email",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  /**
     #swagger.requestBody = {
        required: true,
        schema: { $ref: "#/components/schemas/ForgotPasswordRequest" }
    }

    #swagger.responses[200] = {
        schema:  { $ref: "#/components/schemas/Response" }
    }
    #swagger.responses[400] = {
        schema: { $ref: '#/definitions/BadRequest' }
    }
    #swagger.responses[401] = {
        schema: { $ref: '#/definitions/InvalidToken' }
    }
    #swagger.responses[406] = {
        schema: { $ref: '#/definitions/InvalidOTP' }
    }
    #swagger.responses[409] = {
        schema: { $ref: '#/definitions/Conflict' }
    }
    */
  const { token, otp, password, email } = req.body;

  if (!(token && otp && password && email)) {
    return res.status(400).json({
      message: "Bad Request `token`, `otp`, `password`, `email` is required.",
    });
  }

  jwtVerify(token, async (error, { email, otp }) => {
    if (error) {
      return res.status(401).json({ message: "Invalid token", error });
    }

    if (otp != req.body.otp) {
      return res.status(406).json({ message: "Invalid OTP" });
    }

    const user = await User.findOne({ email });
    if (user) {
      user.password = password;
      await user.save();

      return res.status(200).json({ message: "Password reset successful." });
    } else {
      return res
        .status(404)
        .json({ message: `User with email '${email}' not found.` });
    }
  });

  router.post("/change-password", async (req, res) => {
    /**
     #swagger.requestBody = {
        required: true,
        schema: { $ref: "#/components/schemas/ChangePasswordRequest" }
    }

    #swagger.responses[200] = {
        schema:  { $ref: "#/components/schemas/Response" }
    }
    #swagger.responses[400] = {
        schema: { $ref: '#/definitions/BadRequest' }
    }
    #swagger.responses[401] = {
        schema: { $ref: '#/definitions/InvalidToken' }
    }
    #swagger.responses[409] = {
        schema: { $ref: '#/definitions/Conflict' }
    }
  */
    const { email, oldPassword, newPassword } = req.body;

    // Ensure the required fields are present
    if (!oldPassword || !newPassword || !email) {
      return res.status(400).json({
        message: "'oldPassword', 'newPassword', and 'email' are required.",
      });
    }

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Check if the old password matches the stored password (this assumes plain text password)
      if (oldPassword !== user.password) {
        return res.status(401).json({ message: "Incorrect old password." });
      }

      // Check if the new password is the same as the old password
      if (oldPassword === newPassword) {
        return res.status(409).json({
          message: "New password cannot be the same as the old password.",
        });
      }

      // Update the user's password in the database (plain text password)
      user.password = newPassword;
      await user.save();

      // Return success response
      return res
        .status(200)
        .json({ message: "Password changed successfully." });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error." });
    }
  });
});

module.exports = router;
