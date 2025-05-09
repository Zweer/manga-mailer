import type { StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';

import { BotStack } from './bot-stack';

export class MangaMailerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const logGroup = new LogGroup(this, 'MangaMailerLogGroup', {
      logGroupName: 'manga-mailer',
      retention: RetentionDays.ONE_WEEK,
      // removalPolicy: RemovalPolicy.DESTROY,
    });

    new BotStack(this, 'BotStack', {
      logGroup,
    });
  }
}
