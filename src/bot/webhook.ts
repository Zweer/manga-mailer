import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import type {
  CdkCustomResourceEvent,
  CdkCustomResourceResponse,
  CloudFormationCustomResourceResponseCommon,
} from 'aws-lambda';

import { Bot } from 'grammy';

import { getLogger, getTelegramToken } from './utils';

const logger = getLogger();

class Lambda implements LambdaInterface {
  @logger.injectLambdaContext()
  public async handler(event: CdkCustomResourceEvent<{ endpoint: string }>, _context: unknown): Promise<CdkCustomResourceResponse> {
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
      const isSuccess = await bot.api.setWebhook(endpoint);

      logger.info('Set webhook', { endpoint, isSuccess });
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
