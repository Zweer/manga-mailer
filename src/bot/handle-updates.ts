import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

import type { BotType } from './lib/bot/index.js';

import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics } from '@aws-lambda-powertools/metrics';
import { Tracer } from '@aws-lambda-powertools/tracer';
import { webhookCallback } from 'grammy';

import { createBot } from './lib/bot/index.js';

const tracer = new Tracer();
const logger = new Logger();
const metrics = new Metrics();

class Lambda implements LambdaInterface {
  protected bot: BotType | null = null;

  @tracer.captureLambdaHandler()
  @logger.injectLambdaContext()
  @metrics.logMetrics()
  async handler(event: APIGatewayProxyEventV2, context: unknown) {
    if (!this.bot) {
      this.bot = await createBot();
    }

    return webhookCallback(this.bot, 'aws-lambda-async')(event, context);
  }
}
const lambda = new Lambda();
export const handler = lambda.handler.bind(lambda);
