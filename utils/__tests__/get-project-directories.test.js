import { expect, test } from 'vitest';
import { getProjectDirectories } from '../get-project-directories.js';
import process from 'node:process';

test('should find correct project directories', async () => {
  const PREFIX = process.cwd() + '/utils/__tests__/fixtures/get-project-directories/Developer/';
  const directories = await getProjectDirectories( PREFIX + '*/*');
  expect(directories).toStrictEqual([
    PREFIX + 'github/.name',
    PREFIX + 'gitlab/regular-name',
  ]);
});
