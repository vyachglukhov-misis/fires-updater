import type { NextFunction, Request, Response } from "express"
import { validateBody } from "~/middleware/validate.middleware.js"
import { configSchema } from "./validation-schemas/start-service.schema.js"
import { generateMainTiff } from "../application/update-fires.service.js"

export const startUpdatingFires = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { interval, region } = await validateBody(configSchema, req, res)

        const startFiresUpdatingResult = await generateMainTiff(region)
    } catch (e) {
        next(e)
    }
}

export const stopUpdatingFires = (req: Request, res: Response) => {}
