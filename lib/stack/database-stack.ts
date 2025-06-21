import type { NestedStackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

import { NestedStack } from 'aws-cdk-lib';
import { AttributeType, TableV2 } from 'aws-cdk-lib/aws-dynamodb';

import { PROJECT_NAME } from '../constants.js';
import { tagMe } from '../utils.js';

export class DatabaseStack extends NestedStack {
  userTable: TableV2;
  mangaTable: TableV2;
  chapterTable: TableV2;
  trackerTable: TableV2;

  constructor(scope: Construct, id: string, props?: NestedStackProps) {
    super(scope, id, props);

    tagMe(this, 'database');

    this.userTable = new TableV2(this, 'UserTable', {
      tableName: `${PROJECT_NAME}-user`,
      partitionKey: {
        name: 'id',
        type: AttributeType.NUMBER,
      },
    });

    this.mangaTable = new TableV2(this, 'MangaTable', {
      tableName: `${PROJECT_NAME}-manga`,
      partitionKey: {
        name: 'connector',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
    });

    this.chapterTable = new TableV2(this, 'ChapterTable', {
      tableName: `${PROJECT_NAME}-chapter`,
      partitionKey: {
        name: 'mangaId',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'id',
        type: AttributeType.STRING,
      },
    });

    this.trackerTable = new TableV2(this, 'TrackerTable', {
      tableName: `${PROJECT_NAME}-tracker`,
      partitionKey: {
        name: 'userId',
        type: AttributeType.NUMBER,
      },
      sortKey: {
        name: 'mangaId',
        type: AttributeType.STRING,
      },
    });
  }
}
