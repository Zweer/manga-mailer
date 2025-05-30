import type { Logger } from 'pino';

import pino from 'pino';

import { config } from '@/lib/log/config';

const logger = pino(config);

export function createChildLogger(serviceName: string, parent: Logger = logger): Logger {
  return parent.child({ serviceName });
}
