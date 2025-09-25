import { fork } from "child_process"
import pLimit from "p-limit"
import path from "path"
import { config } from "~/features/fires-updater/config.js"
import type { SectorData } from "~/features/fires-updater/domain/types/sector-data.types.js"

import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PATH_TO_WORKER = path.join(__dirname, "writeDataToTiff.worker.ts")

export function getWriteDataToTiffPromises(sectorsData: SectorData[], paramsMaxCoeff: Record<string, number>) {
    const limit = pLimit(config.maxChildProcesses)

    const promises = sectorsData.map(sectorData =>
        limit(() => {
            return new Promise<void>((resolve, reject) => {
                const child = fork(PATH_TO_WORKER, {
                    execArgv: [
                        "--loader",
                        "ts-node/esm",
                        "--require",
                        "tsconfig-paths/register",
                        "--max-old-space-size=1024",
                    ],
                })

                // Отправляем данные в дочерний процесс
                child.send({ sectorData, paramsMaxCoeff })

                // Ловим сообщения из дочернего процесса
                child.on("message", (msg: any) => {
                    if (msg.status === "writed") {
                        console.log(
                            `✅ ${child.pid} Child завершил запись ${msg.tileName}. pixelsAffected: ${msg.pixelsAffected}`
                        )
                        resolve(msg)
                    } else if (msg.status === "progress") {
                        const { tileName, progress } = msg
                        // table.updateProgress(tileName, progress);
                    } else {
                        console.error(`❌ Ошибка в Child ${msg.tileName}: ${msg.error}`)
                        reject(msg.error)
                    }
                })

                child.on("error", reject)
                child.on("exit", code => {
                    if (code !== 0) reject(new Error(`Child exited with code ${code}`))
                })
            })
        })
    )
    return promises
}
