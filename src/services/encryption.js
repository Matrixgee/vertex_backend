const bcrypt = require("bcryptjs");

async function hashPassword(password) {
  // Hash a password using bcrypt
  const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds
  return hashedPassword;
}

async function verifyPassword(password, hashedPassword) {
  // Verify a password against a hashed password
  return await bcrypt.compare(password, hashedPassword);
}

module.exports = { hashPassword, verifyPassword };
