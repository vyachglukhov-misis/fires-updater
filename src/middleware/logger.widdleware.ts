import type { Request, Response, NextFunction } from "express"
import { logger } from "../logger.js"

export const loggerMiddleware = (envMode: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const start = Date.now()

        res.on("finish", () => {
            const duration = Date.now() - start
            const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`

            if (envMode === "development") {
                logger.debug(logMessage)
            } else {
                logger.info(logMessage)
            }
        })
        next()
    }
}
