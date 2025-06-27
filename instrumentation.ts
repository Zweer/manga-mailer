import { createBot } from '@/lib/bot';
import { createLogger } from '@/lib/logger';

const serviceName = 'instrumentation';

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
  const logger = createLogger(serviceName, 'registerTelegramWebhook');
  const bot = createBot(false);

  const endpoint = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api/bot`;
  logger.debug('setting new endpoint:', endpoint);

  try {
    await bot.api.setWebhook(endpoint);
    logger.debug('✅ endpoint set successfully!');
  } catch (error) {
    logger.error('❌ endpoint set error!');
    logger.debug(error);
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
