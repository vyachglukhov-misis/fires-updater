import path from 'path';
import type { ParamFromObject } from '../../domain/types/fires.types.js';
import { REGIONS } from '../../domain/enums/regions.enum.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KRASNOYARSK_PATH = path.join(__dirname, 'krasnoyarsk');
const NORILSK_PATH = path.join(__dirname, 'norilsk');
const HABAROVSK_PATH = path.join(__dirname, 'habarovsk');

export const pathsToRegion = {
  [REGIONS.KS]: {
    geojson: path.join(KRASNOYARSK_PATH, 'krasnoyarsk_krai.geojson'),
    fires: path.join(KRASNOYARSK_PATH, 'fires_krasnoyarsk.json'),
  },
  [REGIONS.NK]: {
    geojson: path.join(NORILSK_PATH, 'norilsk.geojson'),
    fires: path.join(NORILSK_PATH, 'fires_norilsk.json'),
  },
  [REGIONS.HB]: {
    geojson: path.join(HABAROVSK_PATH, 'habarovsk-region.json'),
    fires: path.join(HABAROVSK_PATH, 'fires_habarovsk.json'),
  },
};

export type WeightedParam<T> = ParamFromObject<T> & { weight: number };

export const paramsToRegion: Record<REGIONS, WeightedParam<any>[]> = {
  [REGIONS.HB]: [
    // {
    //     pathToParam: "object.bc3aef97b9a21dc7900e64d534dc4e0c9.areaBurn",
    //     paramName: "areaBurn",
    //     converter: (val: unknown) => {
    //         if (typeof val === "string") return Number(val)
    //         return 0
    //     },
    //     weight: 0.5,
    // },
  ],
  [REGIONS.KS]: [],
  [REGIONS.NK]: [],
};
