import { Router } from "express"
import { startUpdatingFires, stopUpdatingFires } from "./update-fires.controller.js"

const router = Router()

router.post("/start", startUpdatingFires)
router.post("/stop", stopUpdatingFires)

export { router as firesUpdaterRoutes }
