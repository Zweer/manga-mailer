import { Bot } from 'grammy';

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      TELEGRAM_TOKEN: string;
      VERCEL_URL: string;
    }
  }
}

export async function main() {
  const token = process.env.TELEGRAM_TOKEN;
  const bot = new Bot(token);

  const endpoint = `https://${process.env.VERCEL_URL}`;
  await bot.api.setWebhook(endpoint);
}

main().catch((err: Error) => {
  throw err;
});
