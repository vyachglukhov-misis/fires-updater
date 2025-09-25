import winston from "winston"

const ENVIRONMENT = process.env.NODE_ENV || "development"

const transports = []

if (ENVIRONMENT === "development") {
    transports.push(
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
        })
    )
} else {
    transports.push(
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" })
    )
}

export const logger = winston.createLogger({
    level: ENVIRONMENT === "development" ? "debug" : "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "DD-MM-YYYY" }),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level.toUpperCase()}]: ${message}`
        })
    ),
    transports,
})
