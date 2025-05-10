import process from 'node:process';

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { Entity } from 'dynamodb-toolbox/entity';
import { EntityRepository } from 'dynamodb-toolbox/entity/actions/repository';
import { item, number, string } from 'dynamodb-toolbox/schema';
import { Table } from 'dynamodb-toolbox/table';

import { userKey } from '../../lib/constants';

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      USER_TABLE_NAME: string;
    }
  }
}

const table = new Table({
  name: process.env.USER_TABLE_NAME,
  partitionKey: {
    name: userKey,
    type: 'number',
  },
  documentClient: DynamoDBDocumentClient.from(new DynamoDBClient()),
});

const schema = item({
  [userKey]: number().key(),
  name: string(),
  // eslint-disable-next-line no-control-regex, regexp/no-dupe-characters-character-class
  email: string().validate((email: string) => /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\v\f\x0E-\x1F\x21\x23-\x5B\x5D-\x7F]|\\[\x01-\x09\v\f\x0E-\x7F])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4]\d|[01]?\d{1,2})\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d{1,2}|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\v\f\x0E-\x1F\x21-\x5A\x53-\x7F]|\\[\x01-\x09\v\f\x0E-\x7F])+)\])$/
    .test(email)),
});

const entity = new Entity({
  name: 'user',
  table,
  schema,
  entityAttribute: false,
});

export const userRepository = entity.build(EntityRepository);
