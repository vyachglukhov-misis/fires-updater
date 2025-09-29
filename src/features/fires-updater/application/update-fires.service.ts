import { config } from '@features/fires-updater/config.js';
import type { REGIONS } from '../domain/enums/regions.enum.js';
import {
  paramsToRegion,
  pathsToRegion,
  type WeightedParam,
} from '../infrastructure/static-data/pathsToStaticData.js';
import fs from 'fs';
import type {
  FireBase,
  FireObjectWithWeighedParams,
  ParamFromObject,
  ParamsToObject,
} from '../domain/types/fires.types.js';
import _ from 'lodash';
import {
  cleanDirectories,
  createDirectories,
} from '../infrastructure/chores/directoriesManager.js';
import { divideGeojsonOnNSectors } from '../utils/divideGeojsonOnNSectors.js';
import type { Feature, MultiPolygon } from 'geojson';
import { getTileDataPromises } from '../infrastructure/pipelines/getTileData/getTileDataPromises.js';
import { logger } from '~/logger.js';
import { getWriteDataToTiffPromises } from '../infrastructure/pipelines/writeDataToTiff/getWriteDataToTiffPromises.js';
import { useGdalMerge } from '../infrastructure/pipelines/useGdalMerge.pipeline.js';
import { formatDuration } from '../utils/formatDuration.js';
import path from 'path';
import { workingDirectories } from '../infrastructure/chores/directoriesManager.js';
import winston from 'winston';
const { UPDATING_TASKS_LOGS_DIR } = workingDirectories;

let cronTimeout: NodeJS.Timeout | null = null;
let isRunning = false;

if (!fs.existsSync(UPDATING_TASKS_LOGS_DIR)) {
  fs.mkdirSync(UPDATING_TASKS_LOGS_DIR, { recursive: true });
}

export const startGeneratingMainTiff = (interval: number, region: REGIONS) => {
  
  if (isRunning) {
    return { ok: true, message: 'Генерация тифов по пожарам уже запущена' };
  }

  isRunning = true;

  const runTask = async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const logFilePath = path.join(
      UPDATING_TASKS_LOGS_DIR,
      `fires-${timestamp}.log`,
    );

    // создаем временный транспорт для текущей итерации
    const fileTransport = new winston.transports.File({
      filename: logFilePath,
    });

    logger.add(fileTransport);

    try {
      logger.info(`Начало генерации TIFF для региона ${region}`);
      await generateMainTiff(region); // передаем глобальный логгер
      logger.info('Генерация TIFF завершена');
    } catch (err) {
      logger.error(`Ошибка при генерации TIFF: ${err}`);
    } finally {
      // удаляем временный транспорт после завершения итерации
      logger.remove(fileTransport);
    }

    if (isRunning) {
      cronTimeout = setTimeout(runTask, interval);
    }
  };

  runTask();

  return { ok: true, message: 'Генерация тифов по пожарам запущена' };
};

export const stopGeneratingMainTiff = () => {
  if (!isRunning) return { ok: false, error: 'Генерация тифов не запущена' };

  isRunning = false;
  if (cronTimeout) {
    clearTimeout(cronTimeout);
    cronTimeout = null;
  }

  return { ok: true, message: 'Генерация тифов остановлена' };
};

export const generateMainTiff = async (region: REGIONS) => {
  try {
    const now = Date.now();

    logger.info('Очистка рабочих директорий');
    createDirectories();
    cleanDirectories();

    const params = paramsToRegion[region];
    const firesObjects = await getFires(region, params);
    logger.info(`Получено объектов пожаров: ${firesObjects.length}`);

    const dividedGeojson = getDividedRegionGeoJSON(region);

    const sectorDataPromises = getTileDataPromises(
      dividedGeojson.features,
      firesObjects,
      params,
    );

    const sectorsData = await Promise.all(sectorDataPromises);

    logger.info(
      `После получения данных о тайлах, сожрано памяти: ${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`,
    );

    const paramsMaxCoeff = sectorsData.reduce<Record<string, number>>(
      (acc, sectorData) => {
        const { paramsData } = sectorData;

        Object.entries(paramsData).forEach(([paramName, param]) => {
          const { maxCoeff } = param;
          if (!acc[paramName]) {
            acc[paramName] = maxCoeff;
            return acc;
          }
          acc[paramName] =
            maxCoeff > acc[paramName] ? maxCoeff : acc[paramName];
        });

        return acc;
      },
      {},
    );

    const maxCoefficientsMessage = Object.entries(paramsMaxCoeff).map(
      ([paramName, maxCoefficient]) => {
        return `${paramName}: ${maxCoefficient}`;
      },
    );
    logger.info(
      `Вычислены максимальные коэффициенты: ${maxCoefficientsMessage.join(', ')}`,
    );

    const writingSectorDataPromises = getWriteDataToTiffPromises(
      sectorsData,
      paramsMaxCoeff,
    );

    await Promise.all(writingSectorDataPromises);

    await useGdalMerge()
      .then(tiffFilename =>
        logger.info(
          `gdal_merge.py успешно смёрджил, наименование файла: ${tiffFilename}`,
        ),
      )
      .catch(err => logger.error('Ошибка при gdal_merge.py:', err));

    await toggleGeoserverImageMosaic()

    logger.info('Все дочерние процессы завершены.');
    logger.info(`Время выполнения: ${formatDuration(Date.now() - now)}`);
  } catch (e) {
    throw e;
  }
};

const getFires = async (region: REGIONS, params: WeightedParam<any>[]) => {
  let firesObjects;
  if (config.useMockFiresData) {
    const { fires: firesRawPath } = pathsToRegion[region];
    firesObjects = JSON.parse(fs.readFileSync(firesRawPath, 'utf-8'));
  } else {
    // логика под запрос на коллекцию
    const { fires: firesRawPath } = pathsToRegion[region];
    firesObjects = JSON.parse(fs.readFileSync(firesRawPath, 'utf-8'));
  }
  return getFiresObjectsWithOtherParams(firesObjects, params);
};

const getFiresObjectsWithOtherParams = <
  const T extends readonly ParamFromObject<any>[],
>(
  firesObjects: FireBase[],
  params: T,
) => {
  const fires: FireObjectWithWeighedParams[] = firesObjects
    .filter(
      (obj: any) =>
        !obj.deleted &&
        obj.object.geo &&
        obj.object.geo.geometry &&
        obj.object.geo.geometry.type === 'Point',
    )
    .map((obj: any) => {
      const paramsData = params.reduce((acc, cur) => {
        const { paramName, pathToParam, converter } = cur;
        const rawValue = _.get(obj, pathToParam);
        return { ...acc, [paramName]: converter(rawValue) };
      }, {} as ParamsToObject<T>);
      return {
        ...paramsData,
        geo: {
          type: 'Feature',
          geometry: obj.object.geo.geometry,
          properties: {},
        },
        name: obj.name,
        createdAt: obj.created,
        id: obj._id,
      };
    });
  return fires;
};

const getDividedRegionGeoJSON = (region: REGIONS) => {
  const { geojson: geojsonPath } = pathsToRegion[region];

  const geojson: Feature<MultiPolygon> = JSON.parse(
    fs.readFileSync(geojsonPath, 'utf-8'),
  );

  const N = config.dividingSectors;

  return divideGeojsonOnNSectors(geojson, N);
};

const toggleGeoserverImageMosaic = async () => {
  const getUrl = (geoserverUrl: string, imageMosaicName: string) => {
    return `${geoserverUrl}/rest/workspaces/citorus/coveragestores/${imageMosaicName}/external.imagemosaic`;
  };
  const imagemosaicName = process.env.IMAGE_MOSAIC_NAME;
  const geoserverUrl = process.env.GEOSERVER_URL;
  const geoserverPathToImageMosaic = process.env.IMAGE_MOSAIC_PATH;
  const auth = Buffer.from(`admin:geoserver`).toString('base64')

  logger.info('Инициализация запроса к Geoserver')


  if (!geoserverUrl || !imagemosaicName || !geoserverPathToImageMosaic) {
    throw new Error('IMAGE_MOSAIC_NAME, GEOSERVER_URL, IMAGE_MOSAIC_PATH must be provided')
  }
  const url = getUrl(geoserverUrl, imagemosaicName);

  logger.info(url)

  try {
    const result = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        Authorization: `Basic ${auth}`,
        Accept: 'text/plain',
      },
      body: geoserverPathToImageMosaic,
    });

    const data = await result.text();

    logger.info(`Статус ответа от Geoserver: ${result.status}`);

    if (!result.ok) {
      throw new Error(
        `Обращение к Geoserver обернулось ошибкой: ${result.status}`,
      );
    }
    return data;
  } catch (e) {
    logger.error(e);
    throw e;
  }
};
