import type { BotType } from '../index.js';

import { logger } from '../../../utils.js';
import { commands } from '../constants.js';

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
