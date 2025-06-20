import type { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import type { LogGroup } from 'aws-cdk-lib/aws-logs';
import type { Construct } from 'constructs';

import { join } from 'node:path';

import { Duration, Tags } from 'aws-cdk-lib';
import { LoggingFormat, Runtime, Tracing } from 'aws-cdk-lib/aws-lambda';
import { OutputFormat } from 'aws-cdk-lib/aws-lambda-nodejs';
import { pascalCase } from 'change-case';

import { PROJECT_NAME } from './constants.js';

export function tagMe(stack: Construct, moduleName?: string): void {
  Tags.of(stack).add('Project', pascalCase(PROJECT_NAME));
  Tags.of(stack).add('Module', pascalCase(moduleName ?? PROJECT_NAME));
}

export const rootFolder = join(import.meta.dirname, '..');
export function getNodejsFunctionProps(logGroup: LogGroup): NodejsFunctionProps {
  return {
    runtime: Runtime.NODEJS_22_X,
    depsLockFilePath: join(rootFolder, 'package-lock.json'),
    environment: {
      NODE_OPTIONS: '--enable-source-maps',
      POWERTOOLS_SERVICE_NAME: PROJECT_NAME,
    },
    bundling: {
      banner: 'import { createRequire } from \'module\';const require = createRequire(import.meta.url);',
      esbuildArgs: {
        '--tree-shaking': 'true',
      },
      format: OutputFormat.ESM,
      sourceMap: true,
    },
    logGroup,
    loggingFormat: LoggingFormat.JSON,
    tracing: Tracing.ACTIVE,
    timeout: Duration.seconds(15),
  };
}
