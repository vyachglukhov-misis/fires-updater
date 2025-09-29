import type { Feature } from 'geojson';
import type { FireObjectWithWeighedParams } from '~/features/fires-updater/domain/types/fires.types.js';
import type { WeightedParam } from '../../static-data/pathsToStaticData.js';
import pLimit from 'p-limit';
import { config } from '~/features/fires-updater/config.js';
import type { SectorData } from '~/features/fires-updater/domain/types/sector-data.types.js';
import { fork } from 'child_process';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const ENVIRONMENT = process.env.NODE_ENV


const PATH_TO_WORKER = path.join(__dirname, `getTileData.worker.${ENVIRONMENT === 'production' ? 'js' : 'ts'}`);

export function getTileDataPromises(
  features: Feature[],
  firesObjects: FireObjectWithWeighedParams[],
  params: WeightedParam<any>[],
) {
  const limit = pLimit(config.maxChildProcesses);
  let index = 0;

  const promises = features.map(feature =>
    limit(
      () =>
        new Promise<SectorData>((resolve, reject) => {
          const tileName = `tile_${++index}`;
          const child = fork(PATH_TO_WORKER, {
            execArgv: [
              '--loader',
              'ts-node/esm',
              '--require',
              'tsconfig-paths/register',
              '--max-old-space-size=1024',
            ],
          });
          // Отправляем данные в дочерний процесс
          child.send({ feature, tileName, firesObjects, params });

          // Ловим сообщения из дочернего процесса
          child.on('message', (msg: any) => {
            if (msg.status === 'created') {
              const pathToRead = msg.tiffDataPath;

              const sectorData = JSON.parse(
                fs.readFileSync(pathToRead, 'utf-8'),
              );

              console.log(
                `✅ ${child.pid} Child получил данные по тифу ${sectorData.tileName}. MaxCoefficient: ${sectorData.maxCoefficient}`,
              );
              console.log(
                (process.memoryUsage().rss / 1024 / 1024).toFixed(2),
                'MB',
              );
              resolve(sectorData);
            } else if (msg.status === 'progress') {
              const { tileName, progress } = msg;
              // table.updateProgress(tileName, progress);
            } else {
              console.error(`❌ Ошибка в Child ${msg.tileName}: ${msg.error}`);
              reject(msg.error);
            }
          });

          child.on('error', reject);
          child.on('exit', code => {
            if (code !== 0) reject(new Error(`Child exited with code ${code}`));
          });
        }),
    ),
  );
  return promises;
}
