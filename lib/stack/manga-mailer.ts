import type { StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

import { Stack, Tags } from 'aws-cdk-lib';
import { pascalCase } from 'change-case';

import { PROJECT_NAME } from '../constants.js';
import { BotStack } from './bot-stack.js';

export class MangaMailerStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    Tags.of(this).add('Project', pascalCase(PROJECT_NAME));
    Tags.of(this).add('Module', pascalCase(PROJECT_NAME));

    new BotStack(this, 'BotStack');
  }
}
