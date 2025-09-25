import path from "path"
import type { ParamFromObject } from "../../domain/types/fires.types.js"

export enum REGIONS {
    KS = "krasnoyarsk",
    NK = "norilsk",
    HB = "habarovsk",
}

const KRASNOYARSK_PATH = path.join(__dirname, "krasnoyarsk")
const NORILSK_PATH = path.join(__dirname, "norilsk")
const HABAROVSK_PATH = path.join(__dirname, "habarovsk")

export const pathsToRegion = {
    [REGIONS.KS]: {
        geojson: path.join(KRASNOYARSK_PATH, "krasnoyarsk_krai.geojson"),
        fires: path.join(KRASNOYARSK_PATH, "fires_krasnoyarsk.json"),
    },
    [REGIONS.NK]: {
        geojson: path.join(NORILSK_PATH, "norilsk.geojson"),
        fires: path.join(NORILSK_PATH, "fires_norilsk.json"),
    },
    [REGIONS.HB]: {
        geojson: path.join(HABAROVSK_PATH, "habarovsk-region.json"),
        fires: path.join(HABAROVSK_PATH, "fires_habarovsk.json"),
    },
}

export type WeightedParam<T> = ParamFromObject<T> & { weight: number }
