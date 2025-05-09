import type { NestedStackProps } from 'aws-cdk-lib';
import type { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import type { LogGroup } from 'aws-cdk-lib/aws-logs';
import type { Construct } from 'constructs';

import { join } from 'node:path';

import { CustomResource, NestedStack } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { LoggingFormat } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Provider } from 'aws-cdk-lib/custom-resources';

import { PROJECT_NAME } from './constants';

interface BotStackProps extends NestedStackProps {
  readonly logGroup: LogGroup;
}

export class BotStack extends NestedStack {
  constructor(scope: Construct, id: string, props: BotStackProps) {
    super(scope, id, props);

    const telegramSecret = Secret.fromSecretNameV2(this, 'TelegramSecret', `${PROJECT_NAME}/bot`);

    const api = new RestApi(this, 'RestApi', {
      restApiName: PROJECT_NAME,
    });

    const projectRoot = join(__dirname, '..', 'src', 'bot');
    const commonNodejsProps: NodejsFunctionProps = {
      depsLockFilePath: join(__dirname, '..', 'package-lock.json'),
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
        TELEGRAM_TOKEN_SECRET: telegramSecret.secretName,
      },
      logGroup: props.logGroup,
      loggingFormat: LoggingFormat.JSON,
      bundling: {
        sourceMap: true,
      },
    };
    const handlerFunction = new NodejsFunction(this, 'TelegramHandlerFunction', {
      ...commonNodejsProps,
      functionName: `${PROJECT_NAME}-telegram-handler`,
      entry: join(projectRoot, 'handler.ts'),
    });
    telegramSecret.grantRead(handlerFunction);
    api.root.addMethod('POST', new LambdaIntegration(handlerFunction));

    const webhookFunction = new NodejsFunction(this, 'TelegramWebhookFunction', {
      ...commonNodejsProps,
      functionName: `${PROJECT_NAME}-telegram-webhook`,
      entry: join(projectRoot, 'webhook.ts'),
    });
    telegramSecret.grantRead(webhookFunction);

    const crProvider = new Provider(this, 'TelegramWebhookProvider', {
      onEventHandler: webhookFunction,
    });

    new CustomResource(this, 'TelegramWebhookCustomResource', {
      serviceToken: crProvider.serviceToken,
      properties: {
        url: api.url,
      },
    });
  }
}
