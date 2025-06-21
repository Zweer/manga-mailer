import type { UpsertResult } from './utils.js';

import process from 'node:process';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import * as z from 'zod';

import { USER_TABLE_ENV } from '../../../lib/constants.js';
import { logger } from '../utils.js';

const client = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env[USER_TABLE_ENV]!;

export interface User {
  id: number;
  name: string;
  email: string;
}

const userSchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  email: z.string().email({ message: 'Invalid email address' }),
}).partial();

export async function upsertUser(user: User): Promise<UpsertResult> {
  const parsingResult = userSchema.safeParse(user);
  if (!parsingResult.success) {
    logger.error('[upsertUser] Validation error:', parsingResult.error);

    return {
      success: false,
      validationErrors: Object.entries(parsingResult.error.flatten().fieldErrors).map(([field, errors]) => ({ field, error: errors.join(', ') })),
    };
  }

  try {
    await ddbDocClient.send(new PutCommand({
      TableName: tableName,
      Item: user,
    }));

    return { success: true };
  } catch (rawError) {
    const error = rawError as Error;
    logger.error('[upsertUser] Database error:', error);

    return { success: false, databaseError: error.message };
  }
}

export async function getUser(id: number): Promise<User | null> {
  const { Item: user } = await ddbDocClient.send(new GetCommand({
    TableName: tableName,
    Key: { id },
  }));

  return user as User | null;
}
