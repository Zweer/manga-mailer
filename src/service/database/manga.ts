import type { UpsertResult } from './utils.js';

import process from 'node:process';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import { MANGA_TABLE_ENV } from '../../../lib/constants.js';
import { logger } from '../utils.js';

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env[MANGA_TABLE_ENV]!;

export interface Manga {
  connector: string;
  id: string;
  slug: string;
  title: string;
  author: string;
  artist: string;
  excerpt?: string;
  image: string;
  url: string;
  releasedAt: Date;
  status: string;
  genres: string[];
  score: number;
  chaptersCount: number;
}

export function buildMangaId(connector: string, id: string): string {
  return `${connector}:${id}`;
}

export async function upsertManga(manga: Manga): Promise<UpsertResult> {
  try {
    await ddbDocClient.send(new PutCommand({
      TableName: tableName,
      Item: manga,
    }));

    return { success: true };
  } catch (rawError) {
    const error = rawError as Error;
    logger.error('[upsertManga] Database error:', error);

    return { success: false, databaseError: error.message };
  }
}

export async function getManga(connector: string, id: string): Promise<Manga | null> {
  const { Item: manga } = await ddbDocClient.send(new GetCommand({
    TableName: tableName,
    Key: { connector, id },
  }));

  return manga as Manga | null;
}
