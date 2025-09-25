import path from "path"
import type { ParamFromObject } from "../types/fires.types.js"

export enum REGIONS {
    KS = "krasnoyarsk",
    NK = "norilsk",
    HB = "habarovsk",
}

const staticDataPath = path.join(__dirname, "..", "static-data")

// можно сделать конфиг под каждый регион под одним типом и помещать туда параметры с весами
export const pathsToRegion = {
    [REGIONS.KS]: {
        geojson: path.join(staticDataPath, "krasnoyarsk", "krasnoyarsk_krai.geojson"),
        fires: path.join(staticDataPath, "krasnoyarsk", "fires_krasnoyarsk.json"),
    },
    [REGIONS.NK]: {
        geojson: path.join(staticDataPath, "norilsk", "norilsk.geojson"),
        fires: path.join(staticDataPath, "norilsk", "fires_norilsk.json"),
    },
    [REGIONS.HB]: {
        geojson: path.join(staticDataPath, "habarovsk", "habarovsk-region.json"),
        fires: path.join(staticDataPath, "habarovsk", "fires_habarovsk.json"),
    },
}

export type WeightedParam<T> = ParamFromObject<T> & { weight: number }

export const paramsToRegion: Record<REGIONS, WeightedParam<any>[]> = {
    [REGIONS.HB]: [
        {
            pathToParam: "object.bc3aef97b9a21dc7900e64d534dc4e0c9.areaBurn",
            paramName: "areaBurn",
            converter: (val: unknown) => {
                if (typeof val === "string") return Number(val)
                return 0
            },
            weight: 0.95,
        },
    ],
    [REGIONS.KS]: [],
    [REGIONS.NK]: [],
}
