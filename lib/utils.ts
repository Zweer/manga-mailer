import type { Construct } from 'constructs';

import { Tags } from 'aws-cdk-lib';
import { pascalCase } from 'change-case';

import { PROJECT_NAME } from './constants.js';

export function tagMe(stack: Construct, moduleName?: string): void {
  Tags.of(stack).add('Project', pascalCase(PROJECT_NAME));
  Tags.of(stack).add('Module', pascalCase(moduleName ?? PROJECT_NAME));
}
