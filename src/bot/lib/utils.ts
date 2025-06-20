import process from 'node:process';

import { getSecret } from '@aws-lambda-powertools/parameters/secrets';

import { BOT_TOKEN_SECRET_ENV } from '../../../lib/constants.js';

export async function retrieveToken(): Promise<string> {
  const secret = await getSecret<{ token: string }>(process.env[BOT_TOKEN_SECRET_ENV]!, { transform: 'json' });

  if (!secret) {
    throw new Error('Telegram token secret not found');
  }

  return secret.token;
}
