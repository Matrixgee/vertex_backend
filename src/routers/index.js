const express = require("express");
const { verifyToken, checkAdmin, checkUser } = require("../middleware/auth");

const authRouter = require("./auth");
const depositRouter = require("./deposits");
const earningRouter = require("./earnings");
const investmentRouter = require("./investments");
const planRouter = require("./plans");
const transactionRouter = require("./transactions");
const userRouter = require("./user");
const withdrawalRouter = require("./withdrawals");
const adminRouter = require("./admin");
const mediaRouter = require("./media");
const creditRouter = require("./admin/credit");

const router = express.Router();

router.use(
  "/auth",
  authRouter,
  /**
    #swagger.tags = ['Authentication']
     */
);

router.use(
  "/image",
  mediaRouter,
  /**
    #swagger.tags = ['Media']
     */
);

router.use(verifyToken);

router.use(checkUser);

router.use(
  "/user",
  userRouter,
  /**
    #swagger.tags = ['User']
     */
);

router.use(
  "/credit",
  creditRouter,
  /**
    #swagger.tags = ['Admin Credits/Debits']
     */
);

router.use(
  "/investment",
  investmentRouter,
  /**
    #swagger.tags = ['User Investments']
     */
);

router.use(
  "/withdrawal",
  withdrawalRouter,
  /**
    #swagger.tags = ['User Withdrawals']
     */
);

router.use(
  "/deposit",
  depositRouter,
  /**
    #swagger.tags = ['User Deposits']
     */
);

// router.use(
//   "/earning",
//   earningRouter
//   /**
//     #swagger.tags = ['User Earnings']
//      */
// );

router.use(
  "/transaction",
  transactionRouter,
  /**
    #swagger.tags = ['User Transactions']
     */
);

router.use(
  "/plan",
  planRouter,
  /**
    #swagger.tags = ['Plans']
     */
);

router.use(checkAdmin);

router.use(
  "/admin",
  adminRouter,
  /**
    #swagger.tags = ['Admin']
     */
);

module.exports = router;
