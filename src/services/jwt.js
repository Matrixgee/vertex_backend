const jwt = require("jsonwebtoken");
// require("dotenv").config({ override: true });

const JWT_KEY = `${process.env.JWT_KEY}`;

const jwtSign = (payload, hour = "12h") => {
  return jwt.sign(payload, JWT_KEY, { expiresIn: hour });
};

const jwtVerify = (token, callback) => {
  return jwt.verify(token, JWT_KEY, callback);
};

module.exports = { jwtSign, jwtVerify };
