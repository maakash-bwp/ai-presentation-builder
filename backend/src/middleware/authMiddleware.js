const ApiError = require("../utils/ApiError");
const { verifyToken } = require("../utils/jwt");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  const token = tokenFromHeader || req.cookies?.token;

  if (!token) {
    return next(new ApiError(401, "Unauthorized. Missing token."));
  }

  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.userId).select("-password");

    if (!user) {
      return next(new ApiError(401, "Unauthorized. Invalid token owner."));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new ApiError(401, "Unauthorized. Invalid or expired token."));
  }
};

module.exports = authMiddleware;
