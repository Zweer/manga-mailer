import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

import { Bot, webhookCallback } from 'grammy';

import { getLogger, getTelegramToken } from './utils';

const logger = getLogger();

class Lambda implements LambdaInterface {
  @logger.injectLambdaContext()
  public async handler(event: APIGatewayProxyEventV2, context: unknown): Promise<void> {
    const token = await getTelegramToken();
    const bot = new Bot(token);

    bot.on('message', async (ctx) => {
      await ctx.reply('Hi there!');
    });

    return webhookCallback(bot, 'aws-lambda-async')(event, context);
  }
}

const lambda = new Lambda();
export const handler = lambda.handler.bind(lambda);
