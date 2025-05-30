import type { BotType } from '@/lib/bot/types';

import { commands } from '@/lib/bot/constants';
import { createChildLogger } from '@/lib/log';

const logger = createChildLogger('bot:command:help');

export function createHelpMessage(bot: BotType) {
  const commandDescriptions = commands.map(({ command, description }) => `• /${command} \\- ${description}`).join('\n');

  bot.command('help', async (ctx) => {
    logger.debug({ userId: ctx.from?.id }, 'Received /help command');

    await ctx.reply(
      `⚙️ *Commands*:

${commandDescriptions}`,
      { parse_mode: 'MarkdownV2' },
    );
  });
}
