/* eslint-disable ts/no-unsafe-return */
import type { Logger } from '@aws-lambda-powertools/logger';
import type { StorageAdapter } from 'grammy';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

export class DynamoDBStorageAdapter<T> implements StorageAdapter<T> {
  private readonly client: DynamoDBDocumentClient;
  private readonly valueKey = 'value';

  constructor(
    private readonly tableName: string,
    private readonly keyName: string,
    private readonly logger: Logger,
  ) {
    try {
      const client = new DynamoDBClient();
      this.client = DynamoDBDocumentClient.from(client);
    } catch (error) {
      this.logger.error('[DynamoDBStorageAdapter] Error while creating the DynamoDB client', { error });
      throw new Error('[DynamoDBStorageAdapter] Cannot start DynamoDB client');
    }
  }

  async read(key: string) {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        [this.keyName]: key,
      },
    });

    try {
      const response = await this.client.send(command);
      this.logger.info('[DynamoDBStorageAdapter] read response', { response });

      if (typeof response.Item === 'undefined' || typeof response.Item[this.valueKey] !== 'string') {
        return undefined;
      }

      return JSON.parse(response.Item[this.valueKey] as string);
    } catch (error) {
      this.logger.error('[DynamoDBStorageAdapter] Error while reading from DynamoDB', { error });
      return undefined;
    }
  }

  async write(key: string, value: T) {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        [this.keyName]: key,
        [this.valueKey]: JSON.stringify(value),
      },
    });

    await this.client.send(command);
  }

  async delete(key: string) {
    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: {
        [this.keyName]: key,
      },
    });

    await this.client.send(command);
  }
}
