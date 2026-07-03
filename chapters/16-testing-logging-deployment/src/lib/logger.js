// ============================================================
// Winston Logger Configuration
// Structured logging with multiple transports
// ============================================================

const winston = require("winston");
const path = require("path");

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: "kiryana-store" },
  transports: [
    // Console — colored output for development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length > 1
            ? ` ${JSON.stringify(meta)}`
            : "";
          return `[${timestamp}] ${level}: ${message}${metaStr}`;
        })
      ),
    }),

    // File — errors only
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // File — all logs
    new winston.transports.File({
      filename: path.join(__dirname, "../../logs/combined.log"),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

module.exports = logger;
