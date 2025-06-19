import type { NestedStackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

import type { BotCustomResourceProperties } from '../types.js';
import type { CommonStack } from './common-stack.js';

import { join } from 'node:path';

import { CustomResource, NestedStack } from 'aws-cdk-lib';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Provider } from 'aws-cdk-lib/custom-resources';

import { PROJECT_INITIALS, PROJECT_NAME, TELEGRAM_TOKEN_SECRET_ENV } from '../constants.js';
import { getNodejsFunctionProps, rootFolder, tagMe } from '../utils.js';

interface BotStackProps extends NestedStackProps {
  commonStack: CommonStack;
}

export class BotStack extends NestedStack {
  constructor(scope: Construct, id: string, props: BotStackProps) {
    super(scope, id, props);

    tagMe(this, 'bot');

    const tokenSecret = Secret.fromSecretNameV2(this, 'TokenSecret', `${PROJECT_NAME}-bot`);

    const projectFolder = join(rootFolder, 'src', 'bot');

    const registerEndpointFunction = new NodejsFunction(this, 'RegisterEndpointFunction', {
      ...getNodejsFunctionProps(props.commonStack.logGroup),
      functionName: `${PROJECT_INITIALS.toUpperCase()}-bot-register`,
      entry: join(projectFolder, 'register-endpoint.ts'),
    });
    registerEndpointFunction.addEnvironment(TELEGRAM_TOKEN_SECRET_ENV, tokenSecret.secretName);
    tokenSecret.grantRead(registerEndpointFunction);

    const crProvider = new Provider(this, 'RegisterEndpointProvider', {
      onEventHandler: registerEndpointFunction,
    });

    const properties: BotCustomResourceProperties = {
      endpoint: props.commonStack.httpApiStage.url,
    };
    new CustomResource(this, 'RegisterEndpointResource', {
      serviceToken: crProvider.serviceToken,
      properties,
    });
  }
}
