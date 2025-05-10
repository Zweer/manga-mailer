import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import type {
  CdkCustomResourceEvent,
  CdkCustomResourceResponse,
  CloudFormationCustomResourceResponseCommon,
} from 'aws-lambda';

import type { BotCustomResourceProperties } from '../../lib/types';

import { Bot } from 'grammy';

import { commands } from './lib/constants';
import { getLogger, getTelegramToken } from './utils';

const logger = getLogger();

class Lambda implements LambdaInterface {
  @logger.injectLambdaContext()
  public async handler(
    event: CdkCustomResourceEvent<BotCustomResourceProperties>,
    _context: unknown,
  ): Promise<CdkCustomResourceResponse> {
    const token = await getTelegramToken();
    const bot = new Bot(token);

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

      logger.info('Set webhook', { endpoint, isSuccess: isWebhookSuccess });

      const isHelpCommandSuccess = await bot.api.setMyCommands(commands);
      logger.info('Set help command', { endpoint, isSuccess: isHelpCommandSuccess });
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
