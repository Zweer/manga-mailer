import { webhookCallback } from 'grammy';
import { NextResponse } from 'next/server';

import { createBot } from '@/lib/bot';
import { logger as originalLogger } from '@/lib/logger';

const logger = originalLogger.child({ name: 'route:/' });

const bot = createBot();

export const POST = webhookCallback(bot, 'std/http');

export async function GET() {
  try {
    const webhook = await bot.api.getWebhookInfo();

    return NextResponse.json({ webhook });
  } catch (error) {
    logger.error('Error while retrieving webhook');
    logger.debug(error);

    return NextResponse.json({ error });
  }
}
