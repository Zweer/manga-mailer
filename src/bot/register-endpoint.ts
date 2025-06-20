import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import type { CdkCustomResourceEvent, CloudFormationCustomResourceResponseCommon } from 'aws-lambda';

import type { BotCustomResourceProperties } from '../../lib/types.js';

import { Logger } from '@aws-lambda-powertools/logger';

import { commands } from './lib/bot/constants.js';
import { createBot } from './lib/bot/index.js';

const logger = new Logger();

class Lambda implements LambdaInterface {
  @logger.injectLambdaContext()
  async handler(event: CdkCustomResourceEvent<BotCustomResourceProperties>, _context: unknown) {
    const bot = await createBot();

    logger.info('Received event', { event });

    const commonData: CloudFormationCustomResourceResponseCommon = {
      LogicalResourceId: event.LogicalResourceId,
      PhysicalResourceId: event.RequestType === 'Create' ? event.RequestId : event.PhysicalResourceId,
      RequestId: event.RequestId,
      StackId: event.StackId,
    };

    try {
      const endpoint = event.RequestType === 'Delete' ? '' : event.ResourceProperties.endpoint;
      const isWebhookSuccess = await bot.api.setWebhook(endpoint);

      logger.info('Set webhook', { endpoint, isWebhookSuccess });

      const isHelpCommandSuccess = await bot.api.setMyCommands(commands);
      logger.info('Set help command', { endpoint, isHelpCommandSuccess });
    } catch (error) {
      logger.error('Failed to set webhook', { error });

      return {
        ...commonData,
        Status: 'FAILED',
        Reason: (error as Error).message,
      };
    }

    return {
      ...commonData,
      Status: 'SUCCESS',
    };
  }
}
const lambda = new Lambda();
export const handler = lambda.handler.bind(lambda);
