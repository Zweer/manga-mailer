import { createBot } from '@/lib/bot';

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_RUNTIME: 'nodejs' | 'edge';
      VERCEL_ENV: 'production';
      VERCEL_PROJECT_PRODUCTION_URL: string;
    }
  }
}

async function registerTelegramWebhook() {
  const bot = createBot(false);

  const endpoint = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  console.log('[setTelegramWebhook] setting new endpoint:', endpoint);

  try {
    await bot.api.setWebhook(endpoint);
    console.log('[setTelegramWebhook] ✅ endpoint set successfully!');
  } catch (error) {
    console.error('[setTelegramWebhook] ❌ endpoint set error!');
    console.log(error);
  }
}

export async function register() {
  if (
    process.env.VERCEL_ENV === 'production'
    && process.env.VERCEL_PROJECT_PRODUCTION_URL
    && process.env.NEXT_RUNTIME === 'nodejs'
  ) {
    await registerTelegramWebhook();
  }
}
