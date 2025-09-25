import path from "path"

import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const PROJECT_SRC_PATH = path.join(__dirname, "..")
export const PROJECT_ROOT_PATH = path.join(__dirname, "..", "..")
