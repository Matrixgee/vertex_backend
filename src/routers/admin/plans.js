const express = require("express");
const Plan = require("../../models/plan");
const mongoose = require("mongoose");

const router = express.Router();

router.post("/", async (req, res) => {
  /**
     #swagger.requestBody = {
        required: true,
        schema: { $ref: "#/components/schemas/PlanRequest" }
      }
      #swagger.responses[200] = {
          schema:  { $ref: "#/components/schemas/PlansResponse" }
      }
      #swagger.responses[401] = {
          schema: { $ref: '#/definitions/InvalidToken' }
      }
    */

  const { name, returns, minAmount, duration, maxAmount, uid } = req.body;

  if (!(name && returns && duration && maxAmount && minAmount)) {
    return res.status(400).json({
      message:
        "Bad Request `name`, `returns`, `minAmount`, `duration`, and `maxAmount` are required.",
    });
  }

  // const existingPlan = await Plan.findOne({ name });
  // if (existingPlan) {
  //   return res.status(409).json({
  //     message: "A plan with the same name already exists.",
  //   });
  // }

  const plan = await Plan.create({
    name,
    returns,
    minAmount,
    duration,
    maxAmount,
    uid: uid || "",
  });
  const data = {
    name: plan.name,
    returns: plan.returns,
    minAmount: plan.minAmount,
    duration: plan.duration,
    maxAmount: plan.maxAmount,
    uid: plan?.uid || "",
    createdAt: plan.createdAt.getTime(),
    updatedAt: plan.updatedAt.getTime(),
  };

  return res.status(200).json({ message: "success", data });
});

router.delete("/:id", async (req, res) => {
  /**
      #swagger.responses[200] = {
          schema:  { $ref: "#/components/schemas/PlansResponse" }
      }
      #swagger.responses[401] = {
          schema: { $ref: '#/definitions/InvalidToken' }
      }
    */

  const { id } = req.params;

  if (mongoose.isValidObjectId(id)) {
    const _id = new mongoose.Types.ObjectId(id);
    const plan = await Plan.findById(_id);

    if (plan) {
      await Plan.deleteOne({ _id });
      return res.status(200).json({ message: "success" });
    } else {
      return res.status(404).json({ message: "Plan not found." });
    }
  } else {
    return res.status(406).json({ message: "Invalid plan id." });
  }
});

module.exports = router;
