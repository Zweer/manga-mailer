import type { Logger, LoggerOptions } from 'pino';

import pino from 'pino';

let level = process.env.LOG_LEVEL;
if (typeof level === 'undefined') {
  switch (process.env.NODE_ENV) {
    case 'production':
      level = 'info';
      break;

    case 'test':
      level = 'silent';
      break;

    case 'development':
    default:
      level = 'debug';
      break;
  }
}

const config: LoggerOptions = { level };

if (process.env.NODE_ENV !== 'production' && process.env.LOG_FORMAT !== 'json') {
  config.transport = {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  };
}

const logger = pino(config);

export function createLogger(serviceName: string, moduleName?: string): Logger {
  return logger.child({ moduleName, serviceName });
}
