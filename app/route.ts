import { webhookCallback } from 'grammy';

import { createBot } from '@/lib/bot';

export async function POST() {
  const bot = createBot();

  return webhookCallback(bot, 'next-js');
}
