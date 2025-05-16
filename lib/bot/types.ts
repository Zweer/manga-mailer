import type { ConversationFlavor } from '@grammyjs/conversations';
import type { Context } from 'grammy';

import { Bot as BotConstructor } from 'grammy';

export type BotContext = ConversationFlavor<Context>;
export const Bot = BotConstructor<BotContext>;
export type BotType = BotConstructor<BotContext>;
