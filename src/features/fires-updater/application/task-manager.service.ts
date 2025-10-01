import { logger } from '~/logger.js';
import { REGIONS } from '../domain/enums/regions.enum.js';
import {
  getUserProjectData,
  type TaskConfig,
  type TaskStatus,
} from './userProjectData.js';
import path from 'path';

const processTypeByRegion = {
  [REGIONS.HB]: {
    value: 'Обновление слоя пожаров Хабаровского края',
    key: 'd6f039684d8440e57db236119eb4b8fd6',
  },
  [REGIONS.KS]: {
    value: 'Обновления слоя пожаров Красноярского края',
    key: 'fcee42cc58dc52a3f65a337f8a432d852',
  },
};

const BASE_NJS_URL = process.env.BASE_NJS_URL || 'http://localhost:9000';

const TASK_MANAGER_ROUTES = {
  createTask: 'task-manager/start-task',
  updateTask: 'task-manager/update-task',
};

export const createTask = async (region: REGIONS) => {
  const { project, userId } = getUserProjectData();

  const TASK_MANAGER_CREATE_URL =
    BASE_NJS_URL +
    '/' +
    path.join(`${project}`, TASK_MANAGER_ROUTES.createTask);

  const processType = processTypeByRegion[region];

  const nameConfiguration = `Генерация слоя горимости ${region === REGIONS.HB ? 'Хабаровского' : 'Красноярского'} края`;

  try {
    const { doc, taskId } = (await fetch(TASK_MANAGER_CREATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        processType,
        userId,
        project,
        nameConfiguration,
      }),
    }).then(res => res.json())) as { doc?: any; taskId?: string };

    if (!doc || !taskId) {
      throw new Error('Не удалось создать задачу');
    }

    return { doc, taskId };
  } catch (e: any) {
    logger.error(`Не удалось создать задачу. Ошибка: ${e.message}`);
    throw e;
  }
};

export const updateTask = async (taskId: string, status: TaskStatus) => {
  try {
    const { userId, project } = getUserProjectData();

    const TASK_MANAGER_UPDATE_URL =
      BASE_NJS_URL +
      '/' +
      path.join(`${project}`, TASK_MANAGER_ROUTES.updateTask);

    const { doc } = (await fetch(TASK_MANAGER_UPDATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId,
        userId,
        project,
        status,
      }),
    }).then(res => res.json())) as { doc?: any };
    if (!doc) {
      throw new Error('Не удалось обновить задачу');
    }
    return doc;
  } catch (e: any) {
    logger.error(`Не удалось обновить задачу`, e.message);
  }
};
