import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

import type { Bot } from './lib/bot';

import { webhookCallback } from 'grammy';

import { createBot } from './lib/bot';
import { getLogger } from './utils';

const logger = getLogger();

class Lambda implements LambdaInterface {
  protected bot: Bot | null = null;

  @logger.injectLambdaContext()
  public async handler(event: APIGatewayProxyEventV2, context: unknown): Promise<void> {
    if (!this.bot) {
      this.bot = await createBot(logger);
    }

    return webhookCallback(this.bot, 'aws-lambda-async')(event, context);
  }
}

const lambda = new Lambda();
export const handler = lambda.handler.bind(lambda);
