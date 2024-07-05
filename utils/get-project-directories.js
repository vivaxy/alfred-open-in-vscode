/**
 * @since 2024-07-05
 * @author vivaxy
 */
import glob from 'fast-glob';

/**
 * @param {string} globPattern
 * @returns Promise<Array<string>>
 */
export async function getProjectDirectories(globPattern) {
  return await glob(globPattern, {
    cwd: '/',
    onlyDirectories: true,
    dot: true,
    suppressErrors: true,
  });
}
