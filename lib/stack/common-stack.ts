import type { NestedStackProps } from 'aws-cdk-lib';
import type { HttpStage } from 'aws-cdk-lib/aws-apigatewayv2';
import type { Construct } from 'constructs';

import { NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import { AccessLogFormat } from 'aws-cdk-lib/aws-apigateway';
import { HttpApi, LogGroupLogDestination } from 'aws-cdk-lib/aws-apigatewayv2';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';

import { PROJECT_NAME } from '../constants.js';
import { tagMe } from '../utils.js';

export class CommonStack extends NestedStack {
  logGroup: LogGroup;
  httpApi: HttpApi;
  httpApiStage: HttpStage;

  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id, props);

    tagMe(this, 'common');

    this.logGroup = new LogGroup(this, 'LogGroup', {
      logGroupName: PROJECT_NAME,
      removalPolicy: RemovalPolicy.DESTROY,
      retention: RetentionDays.TWO_WEEKS,
    });

    this.httpApi = new HttpApi(this, 'HttpApi', {
      apiName: PROJECT_NAME,
      createDefaultStage: false,
    });
    this.httpApiStage = this.httpApi.addStage('prod', {
      autoDeploy: true,
      accessLogSettings: {
        destination: new LogGroupLogDestination(this.logGroup),
        format: AccessLogFormat.jsonWithStandardFields(),
      },
    });
  }
}
