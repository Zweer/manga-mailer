import { webhookCallback } from 'grammy';
import { NextResponse } from 'next/server';

import { createBot } from '@/lib/bot';

const bot = createBot();

export const POST = webhookCallback(bot, 'std/http');

export async function GET() {
  try {
    const webhook = await bot.api.getWebhookInfo();

    return NextResponse.json({ webhook });
  } catch (error) {
    console.error('Error while retrieving webhook');
    console.info(error);

    return NextResponse.json({ error });
  }
}
