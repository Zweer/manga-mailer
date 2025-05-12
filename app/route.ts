import { webhookCallback } from 'grammy';

import { createBot } from '@/lib/bot';

const bot = createBot();

export const POST = webhookCallback(bot, 'std/http');
