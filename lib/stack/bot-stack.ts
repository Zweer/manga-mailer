import type { NestedStackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

import type { CommonStack } from './common-stack.js';

import { NestedStack } from 'aws-cdk-lib';

import { tagMe } from '../utils.js';

interface BotStackProps extends NestedStackProps {
  commonStack: CommonStack;
}

export class BotStack extends NestedStack {
  constructor(scope: Construct, id: string, props: BotStackProps) {
    super(scope, id, props);

    tagMe(this, 'bot');
  }
}
