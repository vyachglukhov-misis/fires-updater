import path from 'path';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import fs from 'fs';
import { workingDirectories } from '../../chores/directoriesManager.js';
import type { FireObjectWithWeighedParams } from '~/features/fires-updater/domain/types/fires.types.js';
import type { WeightedParam } from '../../static-data/pathsToStaticData.js';
import { getTileDataPipeline } from './getTileData.pipeline.js';

const { RESULT_OUTPUT_DIR } = workingDirectories;

process.on(
  'message',
  async (msg: {
    feature: any;
    tileName: string;
    globalProj: string;
    firesObjects: FireObjectWithWeighedParams[];
    params: WeightedParam<any>[];
  }) => {
    const { feature, tileName, firesObjects, params } = msg;

    try {
      const creatingTiffResult = await getTileDataPipeline(
        feature,
        tileName,
        firesObjects,
        params,
      );

      const pathToWriteTiffResultData = path.join(
        RESULT_OUTPUT_DIR,
        `${creatingTiffResult.tileName}__result.json`,
      );
      try {
        const jsoned = JSON.stringify(creatingTiffResult);
        fs.writeFileSync(pathToWriteTiffResultData, jsoned);
      } catch (e) {
        console.error(e);
      }

      process.send?.({
        status: 'created',
        tiffDataPath: pathToWriteTiffResultData,
      });
      process.exit(0);
    } catch (err: any) {
      console.error(err);
      process.send?.({ status: 'error', tileName, error: err.message });
      process.exit(1);
    }
  },
);
