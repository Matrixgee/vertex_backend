const express = require("express");
const Transaction = require("../models/transaction");
const { toObjectId, isValidObjectId } = require("../utils/mongoose_utils");

const router = express.Router();

router.get("/all", async (req, res) => {
  /**
      #swagger.responses[200] = {
          schema:  { $ref: "#/components/schemas/TransactionsResponse" }
      }
      #swagger.responses[401] = {
          schema: { $ref: '#/definitions/InvalidToken' }
      }
    */
  const { uid } = req.user;
  const transactions = await Transaction.find({ uid });
  const data = [];

  transactions.forEach((transaction) =>
    data.push({
      id: transaction.id,
      uid: transaction.uid,
      amount: transaction.amount,
      from: transaction.from,
      to: transaction.to,
      plan_name: transaction.plan_name,
      plan_id: transaction.plan_id,
      method: transaction.method,
      investment_id: transaction.investment_id,
      type: transaction.type,
      status: transaction.status,
      createdAt: transaction.createdAt.getTime(),
      updatedAt: transaction.updatedAt.getTime(),
    })
  );

  return res.status(200).json({ message: "success", data });
});

router.get("/:id", async (req, res) => {
  /**
      #swagger.responses[200] = {
          schema:  { $ref: "#/components/schemas/TransactionResponse" }
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
    const transaction = await Transaction.findOne({ uid, _id: toObjectId(id) });

    if (transaction) {
      const data = {
        id: transaction.id,
        uid: transaction.uid,
        amount: transaction.amount,
        from: transaction.from,
        to: transaction.to,
        plan_name: transaction.plan_name,
        plan_id: transaction.plan_id,
        method: transaction.method,
        investment_id: transaction.investment_id,
        type: transaction.type,
        status: transaction.status,
        createdAt: transaction.createdAt.getTime(),
        updatedAt: transaction.updatedAt.getTime(),
      };
      return res.status(200).json({ message: "success", data });
    } else {
      return res.status(404).json({ message: "Transaction not found." });
    }
  } else {
    return res.status(406).json({ message: "Invalid transaction id." });
  }
});

module.exports = router;
