const mongoose = require("mongoose");
const mongodb = require("mongodb");

function isValidObjectId(id) {
  return mongoose.isValidObjectId(id);
}

function toObjectId(id) {
  return new mongodb.ObjectId(id);
}

module.exports = { isValidObjectId, toObjectId };
