import { App, NestedStack, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { beforeEach, describe, it } from 'vitest';

import { tagMe } from '../lib/utils.js';

describe('utils', () => {
  let app: App;

  beforeEach(() => {
    app = new App();
  });

  describe.each([
    { moduleName: 'moduleName', expectedModuleName: 'ModuleName', description: 'with moduleName' },
    { moduleName: undefined, expectedModuleName: 'MangaMailer', description: 'without moduleName' },
  ])('should work $description', ({ moduleName, expectedModuleName }) => {
    function checkTags(stack: Stack) {
      tagMe(stack, moduleName);
      new Bucket(stack, 'Bucket');

      const template = Template.fromStack(stack);

      template.hasResourceProperties('AWS::S3::Bucket', {
        Tags: [
          { Key: 'Module', Value: expectedModuleName },
          { Key: 'Project', Value: 'MangaMailer' },
        ],
      });
    }

    it('should work with a Stack', () => {
      const stack = new Stack(app, 'Stack');
      checkTags(stack);
    });

    it('should work with a NestedStack', () => {
      const stack = new Stack(app, 'Stack');
      const nestedStack = new NestedStack(stack, 'NestedStack');
      checkTags(nestedStack);
    });
  });
});
