import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { HttpApi } from 'aws-cdk-lib/aws-apigatewayv2';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { beforeEach, describe, expect, it } from 'vitest';

import { CommonStack } from '../../lib/stack/common-stack.js';

describe('stack -> common', () => {
  let commonStack: CommonStack;

  beforeEach(() => {
    const app = new App();
    const stack = new Stack(app, 'Stack');
    commonStack = new CommonStack(stack, 'CommonStack');
  });

  it('should create the right resources', () => {
    const template = Template.fromStack(commonStack);

    template.hasResourceProperties('AWS::ApiGatewayV2::Api', {
      Name: 'manga-mailer',
      ProtocolType: 'HTTP',
      Tags: {
        Module: 'Common',
        Project: 'MangaMailer',
      },
    });

    template.hasResourceProperties('AWS::ApiGatewayV2::Stage', {
      AccessLogSettings: {
        DestinationArn: { 'Fn::GetAtt': ['LogGroupF5B46931', 'Arn'] },
        Format: JSON.stringify({
          requestId: '$context.requestId',
          ip: '$context.identity.sourceIp',
          user: '$context.identity.user',
          caller: '$context.identity.caller',
          requestTime: '$context.requestTime',
          httpMethod: '$context.httpMethod',
          resourcePath: '$context.resourcePath',
          status: '$context.status',
          protocol: '$context.protocol',
          responseLength: '$context.responseLength',
        }),
      },
      ApiId: { Ref: 'HttpApiF5A9A8A7' },
      AutoDeploy: true,
      StageName: '$default',
      Tags: {
        Module: 'Common',
        Project: 'MangaMailer',
      },
    });

    template.hasResourceProperties('AWS::Logs::LogGroup', {
      LogGroupName: 'manga-mailer',
      RetentionInDays: 14,
      Tags: [
        { Key: 'Module', Value: 'Common' },
        { Key: 'Project', Value: 'MangaMailer' },
      ],
    });
  });

  it('should expose the right properties', () => {
    expect(commonStack).toHaveProperty('logGroup');
    expect(commonStack.logGroup).toBeInstanceOf(LogGroup);
    expect(commonStack).toHaveProperty('httpApi');
    expect(commonStack.httpApi).toBeInstanceOf(HttpApi);
  });
});
