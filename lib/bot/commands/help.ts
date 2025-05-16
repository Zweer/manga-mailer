import type { BotType } from '@/lib/bot/types';

import { commands } from '@/lib/bot/constants';
import { logger as originalLogger } from '@/lib/logger';

const logger = originalLogger.child({ name: 'instrumentation' });

export function createHelpMessage(bot: BotType) {
  const commandDescriptions = commands.map(({ command, description }) => `• /${command} \\- ${description}`).join('\n');

  bot.command('help', async (ctx) => {
    logger.debug('[help] Received help command');

    await ctx.reply(
      `⚙️ *Commands*:

${commandDescriptions}`,
      { parse_mode: 'MarkdownV2' },
    );
  });
}
