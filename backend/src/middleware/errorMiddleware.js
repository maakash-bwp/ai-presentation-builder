const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`
  });
};

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const message = isApiError ? err.message : "Internal server error.";

  if (statusCode >= 500) {
    logger.error("Unhandled server error", err);
  } else {
    logger.warn("Handled request error", { message, statusCode, path: req.originalUrl });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(isApiError && err.details ? { details: err.details } : {})
  });
};

module.exports = {
  notFoundHandler,
  errorHandler
};
