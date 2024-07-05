import { expect, test } from 'vitest';
import { getProjectsDirectories } from '../get-projects-directories.js';

test('should find correct project directories', async () => {
  const PREFIX = process.cwd() + '/utils/__tests__/fixtures/get-project-directories/Developer/';
  const directories = await getProjectsDirectories( PREFIX + '*/*');
  expect(directories).toStrictEqual([
    PREFIX + 'github/.name',
    PREFIX + 'gitlab/regular-name',
  ]);
});
