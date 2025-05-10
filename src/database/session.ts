import process from 'node:process';

import { Entity } from 'dynamodb-toolbox/entity';
import { EntityRepository } from 'dynamodb-toolbox/entity/actions/repository';
import { item, string } from 'dynamodb-toolbox/schema';
import { Table } from 'dynamodb-toolbox/table';

import { sessionKey } from '../../lib/constants';

declare global {
  // eslint-disable-next-line ts/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      SESSION_TABLE_NAME: string;
    }
  }
}

const table = new Table({
  name: process.env.SESSION_TABLE_NAME,
  partitionKey: {
    name: sessionKey,
    type: 'string',
  },
});

const schema = item({
  [sessionKey]: string().key(),
  value: string(),
});

const entity = new Entity({
  name: 'session',
  table,
  schema,
  entityAttribute: false,
});

export const sessionRepository = entity.build(EntityRepository);
