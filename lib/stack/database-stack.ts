import type { NestedStackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

import { NestedStack } from 'aws-cdk-lib';
import { AttributeType, TableV2 } from 'aws-cdk-lib/aws-dynamodb';

import { PROJECT_NAME } from '../constants.js';

export class DatabaseStack extends NestedStack {
  userTable: TableV2;

  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id, props);

    this.userTable = new TableV2(this, 'UserTable', {
      tableName: `${PROJECT_NAME}-user`,
      partitionKey: {
        name: 'id',
        type: AttributeType.NUMBER,
      },
    });
  }
}
