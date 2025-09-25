import dotenv from "dotenv"

dotenv.config()

import { buildApp } from "./app.js"
const PORT = Number(process.env.PORT) || 2348

const app = buildApp()

const server = app.listen(PORT, () => {
    console.log("server runs at port", PORT)
})
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received, closing http server")
    server.close(() => {
        console.log("HTTP server closed")
    })
})
