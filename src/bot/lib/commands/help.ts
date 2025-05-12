import type { Logger } from '@aws-lambda-powertools/logger';

import type { Bot } from '../bot';

import { commands } from '../constants';

export function createHelpMessage(bot: Bot, logger: Logger) {
  const commandDescriptions = commands.map(({ command, description }) => `• /${command} \\- ${description}`).join('\n');

  bot.command('help', async (ctx) => {
    logger.info('[help] Received help command', { ctx });
    await ctx.reply(
      `⚙️ *Commands*:

${commandDescriptions}`,
      { parse_mode: 'MarkdownV2' },
    );
  });
}
