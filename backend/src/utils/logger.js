const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  if (!meta) {
    return `[${timestamp}] [${level}] ${message}`;
  }

  const safeMeta =
    meta instanceof Error
      ? { message: meta.message, stack: meta.stack }
      : meta;
  return `[${timestamp}] [${level}] ${message} ${JSON.stringify(safeMeta)}`;
};

const logger = {
  info: (message, meta) => console.log(formatMessage("INFO", message, meta)),
  warn: (message, meta) => console.warn(formatMessage("WARN", message, meta)),
  error: (message, meta) => console.error(formatMessage("ERROR", message, meta))
};

module.exports = logger;
