import type { Feature, Point } from "geojson"

type FireBase = {
    geo: Feature<Point>
    name: string
    createdAt: string
    id: string
}

export type ParamFromObject<T> = {
    pathToParam: string
    paramName: string
    converter: (val: unknown) => T
}

type ParamsToObject<T extends readonly ParamFromObject<any>[]> = {
    [K in T[number] as K["paramName"]]: ReturnType<K["converter"]>
}

export type FireObject<T extends Record<string, unknown> = {}> = FireBase & T

export type FireObjectWithWeighedParams = FireObject<ParamsToObject<any>>
