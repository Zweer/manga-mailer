import type { NestedStackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

import type { BotCustomResourceProperties } from '../types.js';
import type { CommonStack } from './common-stack.js';
import type { DatabaseStack } from './database-stack.js';

import { join } from 'node:path';

import { CustomResource, NestedStack } from 'aws-cdk-lib';
import { HttpMethod, HttpRoute, HttpRouteKey } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { AttributeType, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Provider } from 'aws-cdk-lib/custom-resources';

import {
  BOT_SESSION_TABLE_ENV,
  BOT_TOKEN_SECRET_ENV,
  CHAPTER_TABLE_ENV,
  MANGA_TABLE_ENV,
  PROJECT_INITIALS,
  PROJECT_NAME,
  TRACKER_TABLE_ENV,
  USER_TABLE_ENV,
} from '../constants.js';
import { getNodejsFunctionProps, rootFolder, tagMe } from '../utils.js';

interface BotStackProps extends NestedStackProps {
  commonStack: CommonStack;
  databaseStack: DatabaseStack;
}

export class BotStack extends NestedStack {
  constructor(scope: Construct, id: string, props: BotStackProps) {
    super(scope, id, props);

    tagMe(this, 'bot');

    const tokenSecret = Secret.fromSecretNameV2(this, 'TokenSecret', `${PROJECT_NAME}/bot`);

    const projectFolder = join(rootFolder, 'src', 'bot');
    const projectPrefix = `${PROJECT_INITIALS.toUpperCase()}-bot`;

    const sessionTable = new TableV2(this, 'SessionTable', {
      tableName: `${projectPrefix}-session`,
      partitionKey: {
        name: 'key',
        type: AttributeType.STRING,
      },
    });

    const handleUpdatesFunction = new NodejsFunction(this, 'HandleUpdatesFunction', {
      ...getNodejsFunctionProps(props.commonStack.logGroup),
      functionName: `${projectPrefix}-updates`,
      entry: join(projectFolder, 'handle-updates.ts'),
    });
    handleUpdatesFunction.addEnvironment(BOT_TOKEN_SECRET_ENV, tokenSecret.secretName);
    tokenSecret.grantRead(handleUpdatesFunction);
    handleUpdatesFunction.addEnvironment(BOT_SESSION_TABLE_ENV, sessionTable.tableName);
    sessionTable.grantReadWriteData(handleUpdatesFunction);
    handleUpdatesFunction.addEnvironment(USER_TABLE_ENV, props.databaseStack.userTable.tableName);
    props.databaseStack.userTable.grantReadWriteData(handleUpdatesFunction);
    handleUpdatesFunction.addEnvironment(MANGA_TABLE_ENV, props.databaseStack.mangaTable.tableName);
    props.databaseStack.mangaTable.grantReadWriteData(handleUpdatesFunction);
    handleUpdatesFunction.addEnvironment(CHAPTER_TABLE_ENV, props.databaseStack.chapterTable.tableName);
    props.databaseStack.chapterTable.grantReadWriteData(handleUpdatesFunction);
    handleUpdatesFunction.addEnvironment(TRACKER_TABLE_ENV, props.databaseStack.trackerTable.tableName);
    props.databaseStack.trackerTable.grantReadWriteData(handleUpdatesFunction);
    const handleUpdatesRoute = new HttpRoute(this, 'HandleUpdatesRoute', {
      httpApi: props.commonStack.httpApi,
      routeKey: HttpRouteKey.with('/api/bot', HttpMethod.POST),
      integration: new HttpLambdaIntegration('HandleUpdatesIntegration', handleUpdatesFunction),
    });

    const registerEndpointFunction = new NodejsFunction(this, 'RegisterEndpointFunction', {
      ...getNodejsFunctionProps(props.commonStack.logGroup),
      functionName: `${projectPrefix}-register`,
      entry: join(projectFolder, 'register-endpoint.ts'),
    });
    registerEndpointFunction.addEnvironment(BOT_TOKEN_SECRET_ENV, tokenSecret.secretName);
    tokenSecret.grantRead(registerEndpointFunction);

    const crProvider = new Provider(this, 'RegisterEndpointProvider', {
      onEventHandler: registerEndpointFunction,
    });

    const properties: BotCustomResourceProperties = {
      endpoint: `${props.commonStack.httpApiStage.url}${handleUpdatesRoute.path}`,
    };
    new CustomResource(this, 'RegisterEndpointResource', {
      serviceToken: crProvider.serviceToken,
      properties,
    });
  }
}
