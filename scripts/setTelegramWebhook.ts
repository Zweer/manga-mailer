import { createBot } from '@/lib/bot';

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      VERCEL_URL: string;
    }
  }
}

export async function main() {
  const bot = createBot(false);

  const endpoint = `https://${process.env.VERCEL_URL}`;
  await bot.api.setWebhook(endpoint);
}

main().catch((err: Error) => {
  throw err;
});
