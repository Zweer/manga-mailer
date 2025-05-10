import type { Logger } from '@aws-lambda-powertools/logger';
import type { StorageAdapter } from 'grammy';

import { sessionRepository } from '@zweer/manga-mailer-database';

export class DynamoDBStorageAdapter<T> implements StorageAdapter<T> {
  constructor(private readonly logger: Logger) {}

  async read(key: string) {
    this.logger.info('[DynamoDBStorageAdapter] reading', { key });
    const response = await sessionRepository.get({ key });

    if (typeof response.Item === 'undefined') {
      return undefined;
    }

    return JSON.parse(response.Item.value) as T;
  }

  async write(key: string, value: T) {
    await sessionRepository.put({ key, value: JSON.stringify(value) });
  }

  async delete(key: string) {
    await sessionRepository.delete({ key });
  }
}
