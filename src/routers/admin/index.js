const express = require("express");

const depositsRouter = require("./deposits");
const investmentsRouter = require("./investments");
const plansRouter = require("./plans");
const usersRouter = require("./users");
const withdrawalsRouter = require("./withdrawals");
const earningsRouter = require("./earnings");
const deposit = require("../../models/deposit");
const earning = require("../../models/earning");
const investment = require("../../models/investment");
const transaction = require("../../models/transaction");
const withdrawal = require("../../models/withdrawal");
const user = require("../../models/user");
const creditRouter = require("./credit");

const router = express.Router();

router.use(
  "/deposits",
  depositsRouter,
  /**
    #swagger.tags = ['Admin - Deposits']
     */
);

router.get("/all-transactions", async (req, res) => {
  /**
      #swagger.tags = ['Admin - All Transactions']
      #swagger.summary = "Get all Transactions from all models for admin"
      #swagger.description = "This endpoint retrieves all data from deposits, earnings, investments, transactions, and withdrawals, sorted by updatedAt."
      #swagger.responses[200] = {
          description: "Successfully retrieved all Transactions",
          schema: { 
              message: "success",
              data: [
                {
                  id: "string",
                  uid: "string",
                  amount: "number",
                  type: "string",
                  status: "string",
                  createdAt: "number",
                  updatedAt: "number",
                  source: "string"
                }
              ]
          }
      }
      #swagger.responses[500] = {
          description: "Internal server error",
          schema: { message: "Internal server error" }
      }
  */

  try {
    const [investments, transactions, withdrawals] = await Promise.all([
      investment.find(),
      transaction.find(),
      withdrawal.find(),
    ]);

    const mergedData = [
      ...investments.map((doc) => ({
        id: doc.id,
        uid: doc.uid,
        amount: doc.amount,
        type: "Investment",
        status: doc.status,
        createdAt: doc.createdAt.getTime(),
        updatedAt: doc.updatedAt.getTime(),
        source: "Investment",
      })),
      ...transactions.map((doc) => ({
        id: doc.id,
        uid: doc.uid,
        amount: doc.amount,
        type: doc.type,
        status: doc.status,
        createdAt: doc.createdAt.getTime(),
        updatedAt: doc.updatedAt.getTime(),
        source: "Transaction",
      })),
      ...withdrawals.map((doc) => ({
        id: doc.id,
        uid: doc.uid,
        amount: doc.amount,
        type: "Withdrawal",
        status: doc.status,
        createdAt: doc.createdAt.getTime(),
        updatedAt: doc.updatedAt.getTime(),
        source: "Withdrawal",
      })),
    ];

    const transactionWithUser = await Promise.all(
      mergedData.map(async (transaction) => {
        const userData = await user.findOne({ uid: transaction.uid });
        return {
          ...transaction,
          user: userData,
        };
      }),
    );

    transactionWithUser.sort((a, b) => b.updatedAt - a.updatedAt);

    return res
      .status(200)
      .json({ message: "success", data: transactionWithUser });
  } catch (error) {
    console.error("Error fetching all Transactions:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.use(
  "/investments",
  investmentsRouter,
  /**
    #swagger.tags = ['Admin - Investments']
     */
);

router.use(
  "/plans",
  plansRouter,
  /**
    #swagger.tags = ['Admin - Plans']
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
  "/users",
  usersRouter,
  /**
    #swagger.tags = ['Admin - Users']
     */
);

router.use(
  "/withdrawals",
  withdrawalsRouter,
  /**
    #swagger.tags = ['Admin - Withdrawals']
     */
);

router.use(
  "/earnings",
  earningsRouter,
  /**
    #swagger.tags = ['Admin - Earnings']
     */
);

module.exports = router;
