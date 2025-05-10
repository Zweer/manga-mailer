import type { NestedStackProps } from 'aws-cdk-lib';
import type { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import type { LogGroup } from 'aws-cdk-lib/aws-logs';
import type { Construct } from 'constructs';

import type { BotCustomResourceProperties } from '../types';

import { join } from 'node:path';

import { CustomResource, Duration, NestedStack } from 'aws-cdk-lib';
import { AccessLogFormat } from 'aws-cdk-lib/aws-apigateway';
import { HttpApi, HttpMethod, HttpRoute, HttpRouteKey, LogGroupLogDestination } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { AttributeType, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { LoggingFormat } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Provider } from 'aws-cdk-lib/custom-resources';

import { PROJECT_NAME, sessionKey } from '../constants';

interface BotNestedStackProps extends NestedStackProps {
  readonly logGroup: LogGroup;
  readonly userTable: TableV2;
}

export class BotNestedStack extends NestedStack {
  constructor(scope: Construct, id: string, props: BotNestedStackProps) {
    super(scope, id, props);

    const telegramSecret = Secret.fromSecretNameV2(this, 'TelegramSecret', `${PROJECT_NAME}/bot`);

    const httpApi = new HttpApi(this, 'HttpApi', {
      apiName: `${PROJECT_NAME}-api`,
      createDefaultStage: false,
    });
    const stage = httpApi.addStage('prod', {
      autoDeploy: true,
      accessLogSettings: {
        destination: new LogGroupLogDestination(props.logGroup),
        format: AccessLogFormat.jsonWithStandardFields(),
      },
    });

    const sessionTable = new TableV2(this, 'SessionTable', {
      tableName: `${PROJECT_NAME}.session`,
      partitionKey: {
        name: sessionKey,
        type: AttributeType.STRING,
      },
    });

    const projectRoot = join(__dirname, '..', 'src', 'bot');
    const commonNodejsProps: NodejsFunctionProps = {
      depsLockFilePath: join(__dirname, '..', 'package-lock.json'),
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
        TELEGRAM_TOKEN_SECRET: telegramSecret.secretName,
        SESSION_TABLE_NAME: sessionTable.tableName,
        SESSION_KEY_NAME: sessionKey,
      },
      logGroup: props.logGroup,
      loggingFormat: LoggingFormat.JSON,
      bundling: {
        sourceMap: true,
      },
      timeout: Duration.seconds(10),
    };
    const handlerFunction = new NodejsFunction(this, 'TelegramHandlerFunction', {
      ...commonNodejsProps,
      functionName: `${PROJECT_NAME}-telegram-handler`,
      entry: join(projectRoot, 'handler.ts'),
    });
    telegramSecret.grantRead(handlerFunction);
    handlerFunction.addEnvironment('SESSION_TABLE_NAME', sessionTable.tableName);
    sessionTable.grantReadWriteData(handlerFunction);
    handlerFunction.addEnvironment('USER_TABLE_NAME', props.userTable.tableName);
    props.userTable.grantReadWriteData(handlerFunction);
    new HttpRoute(this, 'TelegramWebhookRoute', {
      httpApi,
      routeKey: HttpRouteKey.with('/', HttpMethod.POST),
      integration: new HttpLambdaIntegration('WebhookIntegration', handlerFunction),
    });

    const webhookFunction = new NodejsFunction(this, 'TelegramWebhookFunction', {
      ...commonNodejsProps,
      functionName: `${PROJECT_NAME}-telegram-webhook`,
      entry: join(projectRoot, 'webhook.ts'),
    });
    telegramSecret.grantRead(webhookFunction);

    const crProvider = new Provider(this, 'TelegramWebhookProvider', {
      onEventHandler: webhookFunction,
    });

    const properties: BotCustomResourceProperties = {
      endpoint: stage.url,
    };
    new CustomResource(this, 'TelegramWebhookCustomResource', {
      serviceToken: crProvider.serviceToken,
      properties,
    });
  }
}
