import { config } from "@features/fires-updater/config.js"
import type { REGIONS } from "../domain/enums/regions.enum.js"
import { paramsToRegion, pathsToRegion, type WeightedParam } from "../infrastructure/static-data/pathsToStaticData.js"
import fs from "fs"
import type {
    FireBase,
    FireObjectWithWeighedParams,
    ParamFromObject,
    ParamsToObject,
} from "../domain/types/fires.types.js"
import _ from "lodash"
import { cleanDirectories, createDirectories } from "../infrastructure/chores/directoriesManager.js"
import { divideGeojsonOnNSectors } from "../utils/divideGeojsonOnNSectors.js"
import type { Feature, MultiPolygon } from "geojson"
import { getTileDataPromises } from "../infrastructure/pipelines/getTileData/getTileDataPromises.js"
import { logger } from "~/logger.js"
import { getWriteDataToTiffPromises } from "../infrastructure/pipelines/writeDataToTiff/getWriteDataToTiffPromises.js"
import { useGdalMerge } from "../infrastructure/pipelines/useGdalMerge.pipeline.js"
import { formatDuration } from "../utils/formatDuration.js"

export const generateMainTiff = async (region: REGIONS) => {
    try {
        const now = Date.now()
        createDirectories()
        cleanDirectories()

        const params = paramsToRegion[region]
        const firesObjects = await getFires(region, params)
        const dividedGeojson = getDividedRegionGeoJSON(region)

        const sectorDataPromises = getTileDataPromises(dividedGeojson.features, firesObjects, params)

        const sectorsData = await Promise.all(sectorDataPromises)

        const paramsMaxCoeff = sectorsData.reduce<Record<string, number>>((acc, sectorData) => {
            const { paramsData } = sectorData

            Object.entries(paramsData).forEach(([paramName, param]) => {
                const { maxCoeff } = param
                if (!acc[paramName]) {
                    acc[paramName] = maxCoeff
                    return acc
                }
                acc[paramName] = maxCoeff > acc[paramName] ? maxCoeff : acc[paramName]
            })

            return acc
        }, {})

        const maxCoefficientsMessage = Object.entries(paramsMaxCoeff).map(([paramName, maxCoefficient]) => {
            return `${paramName}: ${maxCoefficient}`
        })
        logger.info(maxCoefficientsMessage.join(", "))

        const writingSectorDataPromises = getWriteDataToTiffPromises(sectorsData, paramsMaxCoeff)

        await Promise.all(writingSectorDataPromises)

        useGdalMerge()

        console.log("Все дочерние процессы завершены.")
        console.log(`Время выполнения: ${formatDuration(Date.now() - now)}`)
    } catch (e) {
        throw e
    }
}

const getFires = async (region: REGIONS, params: WeightedParam<any>[]) => {
    let firesObjects
    if (config.useMockFiresData) {
        const { fires: firesRawPath } = pathsToRegion[region]
        firesObjects = JSON.parse(fs.readFileSync(firesRawPath, "utf-8"))
    } else {
        // логика под запрос на коллекцию
        const { fires: firesRawPath } = pathsToRegion[region]
        firesObjects = JSON.parse(fs.readFileSync(firesRawPath, "utf-8"))
    }
    return getFiresObjectsWithOtherParams(firesObjects, params)
}

const getFiresObjectsWithOtherParams = <const T extends readonly ParamFromObject<any>[]>(
    firesObjects: FireBase[],
    params: T
) => {
    const fires: FireObjectWithWeighedParams[] = firesObjects
        .filter(
            (obj: any) =>
                !obj.deleted && obj.object.geo && obj.object.geo.geometry && obj.object.geo.geometry.type === "Point"
        )
        .map((obj: any) => {
            const paramsData = params.reduce((acc, cur) => {
                const { paramName, pathToParam, converter } = cur
                const rawValue = _.get(obj, pathToParam)
                return { ...acc, [paramName]: converter(rawValue) }
            }, {} as ParamsToObject<T>)
            return {
                ...paramsData,
                geo: {
                    type: "Feature",
                    geometry: obj.object.geo.geometry,
                    properties: {},
                },
                name: obj.name,
                createdAt: obj.created,
                id: obj._id,
            }
        })
    return fires
}

const getDividedRegionGeoJSON = (region: REGIONS) => {
    const { geojson: geojsonPath } = pathsToRegion[region]

    const geojson: Feature<MultiPolygon> = JSON.parse(fs.readFileSync(geojsonPath, "utf-8"))

    const N = config.dividingSectors

    return divideGeojsonOnNSectors(geojson, N)
}
