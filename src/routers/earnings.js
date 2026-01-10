const express = require("express");
const Earning = require("../models/earning");
const Plan = require("../models/plan");
const { toObjectId, isValidObjectId } = require("../utils/mongoose_utils");

const router = express.Router();

router.get("/all", async (req, res) => {
  /**
      #swagger.responses[200] = {
          schema:  { $ref: "#/components/schemas/EarningsResponse" }
      }
      #swagger.responses[401] = {
          schema: { $ref: '#/definitions/InvalidToken' }
      }
    */
  const { uid } = req.user;
  const earnings = await Earning.find({ uid });
  const data = [];

  for (const earning of earnings) {
    const plan = await Plan.findById(toObjectId(earning.plan_id));
    data.push({
      id: earning.id,
      uid: earning.uid,
      amount: earning.amount,
      plan_name: earning.plan_name,
      plan_id: earning.plan_id,
      duration: plan.duration,
      price: plan.price,
      investment_id: earning.investment_id,
      createdAt: earning.createdAt.getTime(),
      updatedAt: earning.updatedAt.getTime(),
    });
  }

  return res.status(200).json({ message: "success", data });
});

router.get("/:id", async (req, res) => {
  /**
      #swagger.responses[200] = {
          schema:  { $ref: "#/components/schemas/EarningResponse" }
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
    const earning = await Earning.findOne({ uid, _id: toObjectId(id) });

    if (earning) {
      const data = {
        id: earning.id,
        uid: earning.uid,
        amount: earning.amount,
        plan_name: earning.plan_name,
        plan_id: earning.plan_id,
        investment_id: earning.investment_id,
        createdAt: earning.createdAt?.getTime(),
        updatedAt: earning.updatedAt?.getTime(),
      };
      return res.status(200).json({ message: "success", data });
    } else {
      return res.status(404).json({ message: "Earning not found." });
    }
  } else {
    return res.status(406).json({ message: "Invalid earning id." });
  }
});

module.exports = router;
