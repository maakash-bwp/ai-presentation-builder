const mongoose = require("mongoose");
const env = require("./env");
const logger = require("../utils/logger");

const connectDatabase = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: env.mongoServerSelectionTimeoutMs,
    connectTimeoutMS: env.mongoConnectTimeoutMs
  });
  logger.info("MongoDB connected.");
};

module.exports = connectDatabase;
