import type { NestedStackProps } from 'aws-cdk-lib';
import type { LogGroup } from 'aws-cdk-lib/aws-logs';
import type { Construct } from 'constructs';

import { NestedStack } from 'aws-cdk-lib';
import { AttributeType, TableV2 } from 'aws-cdk-lib/aws-dynamodb';

import { PROJECT_NAME } from '../constants';

interface MangaMailerNestedStackProps extends NestedStackProps {
  readonly logGroup: LogGroup;
}

export class MangaMailerNestedStack extends NestedStack {
  readonly userTable: TableV2;
  readonly userTablePartitionKey = 'userId';
  readonly userTableSortKey = 'mangaId';

  constructor(scope: Construct, id: string, props: MangaMailerNestedStackProps) {
    super(scope, id, props);

    this.userTable = new TableV2(this, 'UserTable', {
      tableName: `${PROJECT_NAME}.user`,
      partitionKey: {
        name: 'userId',
        type: AttributeType.NUMBER,
      },
    });

    new TableV2(this, 'MangaTable', {
      tableName: `${PROJECT_NAME}.manga`,
      partitionKey: {
        name: 'userId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'mangaId',
        type: AttributeType.STRING,
      },
    });
  }
}
