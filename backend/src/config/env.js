const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(process.cwd(), ".env")
});

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai_presentation_builder",
  mongoServerSelectionTimeoutMs: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 10000,
  mongoConnectTimeoutMs: Number(process.env.MONGO_CONNECT_TIMEOUT_MS) || 10000,
  jwtSecret: process.env.JWT_SECRET || "dev_secret_change_me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  passwordResetJwtExpiresIn: process.env.PASSWORD_RESET_JWT_EXPIRES_IN || "15m",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173",
  appBaseUrl: process.env.APP_BASE_URL || "http://localhost:5173",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  smtpFromEmail: process.env.SMTP_FROM_EMAIL || "",
  smtpFromName: process.env.SMTP_FROM_NAME || "SlideCraft AI",
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite",
  geminiBaseUrl:
    process.env.GEMINI_BASE_URL ||
    "https://generativelanguage.googleapis.com/v1beta/models",
  geminiTimeoutMs: Number(process.env.GEMINI_TIMEOUT_MS) || 60000,
  groqApiKey: process.env.GROQ_API_KEY || "",
  groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  groqBaseUrl: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1/chat/completions",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  imageProvider: process.env.IMAGE_PROVIDER || "hybrid",
  pexelsApiKey: process.env.PEXELS_API_KEY || "",
  pexelsBaseUrl: process.env.PEXELS_BASE_URL || "https://api.pexels.com/v1",
  unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY || "",
  unsplashBaseUrl: process.env.UNSPLASH_BASE_URL || "https://api.unsplash.com",
  cloudflareWorkerImageUrl: process.env.CF_WORKER_IMAGE_URL || "",
  cloudflareWorkerApiKey: process.env.CF_WORKER_API_KEY || "",
  otpExpiresInMinutes: Number(process.env.OTP_EXPIRES_IN_MINUTES) || 10,
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX) || 200
};

const rawClientOrigins = env.clientOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const localClientOrigins = new Set(rawClientOrigins);

rawClientOrigins.forEach((origin) => {
  if (origin.includes("localhost")) {
    localClientOrigins.add(origin.replace("localhost", "127.0.0.1"));
  }

  if (origin.includes("127.0.0.1")) {
    localClientOrigins.add(origin.replace("127.0.0.1", "localhost"));
  }
});

env.clientOrigins = [...localClientOrigins];

if (!env.jwtSecret || env.jwtSecret === "dev_secret_change_me") {
  if (env.nodeEnv === "production") {
    throw new Error("JWT_SECRET must be set in production.");
  }
}

module.exports = env;
