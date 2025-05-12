import { createBot } from '@/lib/bot';

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      VERCEL_PROJECT_PRODUCTION_URL: string;
    }
  }
}

export async function main() {
  const bot = createBot(false);

  const endpoint = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  console.log('[setTelegramWebhook] setting new endpoint:', endpoint);

  await bot.api.setWebhook(endpoint);
  console.log('[setTelegramWebhook] ✅ endpoint set successfully!');
}

main().catch((err: Error) => {
  throw err;
});
