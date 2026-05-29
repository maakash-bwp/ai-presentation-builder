// Force direct outbound traffic for backend API providers (Groq/Pexels/etc.).
// Some environments inject broken local proxies like 127.0.0.1:9.
for (const key of [
  "HTTP_PROXY",
  "http_proxy",
  "HTTPS_PROXY",
  "https_proxy",
  "ALL_PROXY",
  "all_proxy"
]) {
  delete process.env[key];
}

const app = require("./src/app");
const connectDatabase = require("./src/config/db");
const env = require("./src/config/env");
const logger = require("./src/utils/logger");

const startServer = async () => {
  try {
    await connectDatabase();

    const server = app.listen(env.port, () => {
      logger.info(`Server listening on port ${env.port} (${env.nodeEnv})`);
    });

    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info("HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

startServer();
