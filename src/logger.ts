import winston from 'winston';

const ENVIRONMENT = process.env.NODE_ENV || 'development';

import { workingDirectories } from './features/fires-updater/infrastructure/chores/directoriesManager.js';
const { MAIN_LOGS_DIR } = workingDirectories;

const transports = [];

if (ENVIRONMENT === 'development') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
  );
} else {
  transports.push(
    new winston.transports.File({
      filename: `${MAIN_LOGS_DIR}/error.log`,
      level: 'error',
    }),
    new winston.transports.File({ filename: `${MAIN_LOGS_DIR}/combined.log` }),
  );
}

export const logger = winston.createLogger({
  level: ENVIRONMENT === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    }),
  ),
  transports,
});
