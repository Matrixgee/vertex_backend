const express = require("express");
const { toObjectId, isValidObjectId } = require("../utils/mongoose_utils");
const Plan = require("../models/plan");
const user = require("../models/user");

const router = express.Router();

router.get("/all", async (req, res) => {
  /**
      #swagger.responses[200] = {
          schema:  { $ref: "#/components/schemas/PlansResponse" }
      }
      #swagger.responses[401] = {
          schema: { $ref: '#/definitions/InvalidToken' }
      }
    */
  try {
    const plans = await Plan.find();

    const uids = plans.map((plan) => plan.uid).filter((uid) => uid);

    const users = await user.find({ uid: { $in: uids } }, { password: 0 });

    const userMap = users.reduce((map, user) => {
      map[user.uid] = user;
      return map;
    }, {});

    // Add user information to each plan
    const data = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      returns: plan.returns,
      minAmount: plan.minAmount,
      duration: plan.duration,
      maxAmount: plan.maxAmount,
      uid: plan?.uid || "",
      user: userMap[plan.uid] || null,
    }));

    return res.status(200).json({ message: "success", data });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  /**
      #swagger.responses[200] = {
          schema:  { $ref: "#/components/schemas/PlanResponse" }
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
    const plan = await Plan.findOne({ _id: toObjectId(id) });

    if (plan) {
      const data = {
        name: plan.name,
        returns: plan.returns,
        minAmount: plan.minAmount,
        duration: plan.duration,
        maxAmount: plan.maxAmount,
        uid: plan?.uid || "",
        createdAt: plan.createdAt?.getTime(),
        updatedAt: plan.updatedAt?.getTime(),
      };
      return res.status(200).json({ message: "success", data });
    } else {
      return res.status(404).json({ message: "Plan not found." });
    }
  } else {
    return res.status(406).json({ message: "Invalid plan id." });
  }
});

module.exports = router;
