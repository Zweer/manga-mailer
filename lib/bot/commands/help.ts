import type { Bot } from '../';

import { commands } from '../constants';

export function createHelpMessage(bot: Bot) {
  const commandDescriptions = commands.map(({ command, description }) => `• /${command} \\- ${description}`).join('\n');

  bot.command('help', async (ctx) => {
    console.log('[help] Received help command');

    await ctx.reply(
      `⚙️ *Commands*:

${commandDescriptions}`,
      { parse_mode: 'MarkdownV2' },
    );
  });
}
