import type { BotType } from '@/lib/bot/types';

import { commands } from '@/lib/bot/constants.js';
import { createLogger } from '@/lib/logger';

const logger = createLogger('bot:help');

export function handleHelpCommand(bot: BotType): void {
  const commandDescriptions = commands.map(({ command, description }) => `• /${command} \\- ${description}`).join('\n');

  bot.command('help', async (ctx) => {
    logger.debug('Received /help command', { userId: ctx.from?.id });

    await ctx.reply(
      `⚙️ *Commands*:

${commandDescriptions}`,
      { parse_mode: 'MarkdownV2' },
    );
  });
}
