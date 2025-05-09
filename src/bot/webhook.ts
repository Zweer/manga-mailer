import type {
  CdkCustomResourceHandler,
  CloudFormationCustomResourceResponseCommon,
} from 'aws-lambda';

import { Bot } from 'grammy';

import { getTelegramToken } from './utils';

export const handler: CdkCustomResourceHandler<{ endpoint: string }> = async (event) => {
  const commonData: CloudFormationCustomResourceResponseCommon = {
    LogicalResourceId: event.LogicalResourceId,
    PhysicalResourceId: event.RequestType === 'Create' ? event.RequestId : event.PhysicalResourceId,
    RequestId: event.RequestId,
    StackId: event.StackId,
  };

  const token = await getTelegramToken();
  const bot = new Bot(token);

  try {
    const endpoint = event.RequestType === 'Delete' ? '' : event.ResourceProperties.endpoint;
    await bot.api.setWebhook(endpoint);
  } catch (error) {
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
};
