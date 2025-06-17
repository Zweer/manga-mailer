import type { NestedStackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

import { NestedStack, Tags } from 'aws-cdk-lib';
import { pascalCase } from 'change-case';

import { PROJECT_NAME } from '../constants.js';

export class BotStack extends NestedStack {
  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id, props);

    Tags.of(this).add('Project', pascalCase(PROJECT_NAME));
    Tags.of(this).add('Module', pascalCase('bot'));
  }
}
