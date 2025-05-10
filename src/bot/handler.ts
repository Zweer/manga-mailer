import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

import { Bot, webhookCallback } from 'grammy';

import { getLogger, getTelegramToken } from './utils';

const logger = getLogger();

class Lambda implements LambdaInterface {
  protected bot: Bot | null = null;

  async createBot(): Promise<Bot> {
    const token = await getTelegramToken();
    const bot = new Bot(token);
    bot.on('message', async (ctx) => {
      logger.info('Received message', { message: ctx.message });
      await ctx.reply('Hi there!');
    });

    return bot;
  }

  @logger.injectLambdaContext()
  public async handler(event: APIGatewayProxyEventV2, context: unknown): Promise<void> {
    if (!this.bot) {
      this.bot = await this.createBot();
    }

    this.bot.on('message', async (ctx) => {
      logger.info('Received message', { originalMessage: ctx.message }, { ctx });
      await ctx.reply('Hi there!');
    });

    return webhookCallback(this.bot, 'aws-lambda-async')(event, context);
  }
}

const lambda = new Lambda();
export const handler = lambda.handler.bind(lambda);
