const { jwtVerify } = require("../services/jwt");

const verifyToken = (req, res, next) => {
  const bearer = req.header("Authorization");

  if (bearer) {
    if (bearer.startsWith("Bearer ")) {
      const token = bearer.split(" ")[1];

      jwtVerify(token, (error, user) => {
        if (error) {
          return res.status(401).json({ message: "Invalid token", error });
        }
        req.user = user;
        next();
      });
    } else {
      return res
        .status(401)
        .json({ message: "Authorization type is Bearer <token>" });
    }
  } else {
    return res.status(401).json({ message: "Access denied" });
  }
};

const checkAdmin = async (req, res, next) => {
  const type = req.user.type;

  try {
    if (type == "admin") {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "Access denied. You are not an admin." });
    }
  } catch (error) {
    console.error("Error checking admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const checkUser = async (req, res, next) => {
  try {
    if (req.user) {
      next();
    } else {
      return res
        .status(403)
        .json({ message: "Access denied. You are not a user." });
    }
  } catch (error) {
    console.error("Error checking user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  verifyToken,
  checkAdmin,
  checkUser,
};
