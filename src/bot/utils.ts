import process from 'node:process';

import { Logger } from '@aws-lambda-powertools/logger';
import { getSecret } from '@aws-lambda-powertools/parameters/secrets';

import { PROJECT_NAME } from '../../lib/constants';

export async function getTelegramToken(): Promise<string> {
  const secret = await getSecret<{ token: string }>(process.env.TELEGRAM_TOKEN_SECRET!, { transform: 'json' });

  if (!secret) {
    throw new Error('Failed to retrieve the secret or token is missing');
  }

  return secret.token;
}

export function getLogger(): Logger {
  return new Logger({ serviceName: PROJECT_NAME });
}
