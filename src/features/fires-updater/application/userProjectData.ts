import type { REGIONS } from '../domain/enums/regions.enum.js';

export type UserProjectData = {
  project: string | null;
  userId: string | null;
};
let userProjectData: UserProjectData = {
  project: null,
  userId: null,
};

export type TaskStatus = {
  command: 'progress';
  value: number;
  logLink: string;
  config: TaskConfig;
};

export type TaskConfig = {
  taskId: string | null;
  isRunning: boolean;
  interval: number | null;
  region: REGIONS | null;
};
let config: TaskConfig = {
  taskId: null,
  isRunning: false,
  interval: null,
  region: null,
};

export const updateConfig = (configUpdates: {
  isRunning?: boolean;
  interval?: number;
  region?: REGIONS;
  taskId?: string;
}) => {
  config = { ...config, ...configUpdates };
  return config;
};
export const getConfig = () => {
  return config;
};
export const getUserProjectData = () => {
  return userProjectData;
};

export const updateUserProjectData = (userProjectDataUpdates: {
  userId?: string;
  project?: string;
}) => {
  userProjectData = { ...userProjectData, ...userProjectDataUpdates };
  return userProjectData;
};
