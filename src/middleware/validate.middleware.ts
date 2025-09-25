import type { Request, Response } from "express"
import { ZodError, type ZodType } from "zod"
import { logger } from "~/logger.js"

function createValidate(key: "body" | "query" | "params") {
    return async function validate<T>(schema: ZodType<T>, req: Request, res: Response): Promise<T> {
        try {
            const validationResult = await schema.parseAsync(req[key])
            return validationResult
        } catch (e) {
            if (e instanceof ZodError) {
                const issuesMessages = e.issues.map(i => `Paramether ${i.path}: ${i.message}`)
                const errorMessage = `Bad request, issues: ${issuesMessages.join("; ")}`
                res.status(400).json({
                    ok: false,
                    error: errorMessage,
                })
                logger.error(issuesMessages)
                throw new Error("Validation error")
            }
            throw e
        }
    }
}

export const validateBody = createValidate("body")
export const validateQuery = createValidate("query")
export const validateParams = createValidate("params")
