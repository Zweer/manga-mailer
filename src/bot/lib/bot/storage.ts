import type { StorageAdapter } from 'grammy';

import process from 'node:process';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import { BOT_SESSION_TABLE_ENV } from '../../../../lib/constants.js';

type Serializer<Session> = (input: Session) => string;
type Deserializer<Session> = (input: string) => Session;

interface ConstructorOptions<Session> {
  tableName?: string;
  serializer?: Serializer<Session>;
  deserializer?: Deserializer<Session>;
}

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

export class DynamoDBAdapter<T> implements StorageAdapter<T> {
  private tableName: string;
  serializer: Serializer<T>;
  deserializer: Deserializer<T>;

  constructor(opts: ConstructorOptions<T> = {}) {
    this.tableName = opts.tableName ?? process.env[BOT_SESSION_TABLE_ENV]!;

    this.serializer = opts.serializer
      ?? (input => JSON.stringify(input, null, '\t'));
    this.deserializer = opts.deserializer
      ?? (input => JSON.parse(input) as T);
  }

  async read(key: string): Promise<T | undefined> {
    const { Item: item } = await ddbDocClient.send(new GetCommand({
      TableName: this.tableName,
      Key: { key },
    }));

    if (typeof item === 'undefined') {
      return undefined;
    }

    return this.deserializer(item.value as string);
  }

  async write(key: string, value: T): Promise<void> {
    await ddbDocClient.send(new PutCommand({
      TableName: this.tableName,
      Item: {
        key,
        value: this.serializer(value),
      },
    }));
  }

  async delete(key: string): Promise<void> {
    await ddbDocClient.send(new DeleteCommand({
      TableName: this.tableName,
      Key: { key },
    }));
  }
}
