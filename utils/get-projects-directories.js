/**
 * @since 2024-07-05
 * @author vivaxy
 */
import glob from 'fast-glob';

export async function getProjectsDirectories(globPattern) {
  return await glob(globPattern, {
    cwd: '/',
    onlyDirectories: true,
    dot: true,
    suppressErrors: true,
  })
}
