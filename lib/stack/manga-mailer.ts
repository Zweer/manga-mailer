import type { StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

import { Stack } from 'aws-cdk-lib';

import { tagMe } from '../utils.js';
import { BotStack } from './bot-stack.js';
import { CommonStack } from './common-stack.js';
import { DatabaseStack } from './database-stack.js';

export class MangaMailerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    tagMe(this);

    const commonStack = new CommonStack(this, 'CommonStack');
    const databaseStack = new DatabaseStack(this, 'DatabaseStack');

    new BotStack(this, 'BotStack', { commonStack, databaseStack });
  }
}
