import { Logger } from '@aws-lambda-powertools/logger';

export const logger = new Logger({
  persistentKeys: {
    module: 'service',
  },
});
