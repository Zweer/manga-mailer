import type { UpsertResult } from './utils.js';

import process from 'node:process';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import { TRACKER_TABLE_ENV } from '../../../lib/constants.js';
import { logger } from '../utils.js';

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env[TRACKER_TABLE_ENV]!;

export interface Tracker {
  userId: number;
  mangaId: string;
  lastReadChapter: number;
}

export async function upsertTracker(tracker: Tracker): Promise<UpsertResult> {
  try {
    await ddbDocClient.send(new PutCommand({
      TableName: tableName,
      Item: tracker,
    }));

    return { success: true };
  } catch (rawError) {
    const error = rawError as Error;
    logger.error('[upsertTracker] Database error:', error);

    return { success: false, databaseError: error.message };
  }
}

export async function getTracker(userId: number, mangaId: string): Promise<Tracker | null> {
  const { Item: tracker } = await ddbDocClient.send(new GetCommand({
    TableName: tableName,
    Key: { userId, mangaId },
  }));

  return tracker as Tracker | null;
}
