import express from "express"
import { loggerMiddleware } from "./logger.widdleware.js"
import { apiRouter } from "./routes.js"

const ENVIRONMENT = process.env.NODE_ENV || "development"

export function buildApp() {
    const app = express()

    app.use(express.json())
    app.use(loggerMiddleware(ENVIRONMENT))

    app.use("/api", apiRouter)
    return app
}
