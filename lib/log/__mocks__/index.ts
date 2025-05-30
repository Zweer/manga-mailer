import type { Logger } from 'pino';

import pino from 'pino';

import { loggerWriteSpy } from '@/test/log';

const { createChildLogger: actualCreateChildLogger } = jest.requireActual<typeof import('@/lib/log')>('@/lib/log');

const logger = pino({
  level: 'trace',
  timestamp: false,
  base: null,
  formatters: {
    level: label => ({ level: label }),
    log: object => object,
  },
}, {
  write(msg: string) {
    loggerWriteSpy(JSON.parse(msg));
  },
});

export function createChildLogger(serviceName: string): Logger {
  return actualCreateChildLogger(serviceName, logger);
}
