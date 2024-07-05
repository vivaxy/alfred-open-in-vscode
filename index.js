/**
 * @since 2019-08-14 02:43
 * @author vivaxy
 */
import path from 'node:path';
import alfy from 'alfy';
import { getProjectDirectories } from './utils/get-project-directories.js';

const PROJECT_CACHE_KEY = 'projects';

async function updateProjectsCache() {
  const projectsDirectories = await getProjectDirectories(process.env.projects);
  const projects = projectsDirectories.map(function(directory) {
    return {
      name: path.basename(directory),
      absolutePath: directory,
    };
  });
  alfy.cache.set(PROJECT_CACHE_KEY, JSON.stringify(projects));
}

/**
 * @returns {Array<{ name: string, absolutePath: string }>}
 */
function getProjects() {
  const projectsCache = /** @type {string} */(alfy.cache.get(PROJECT_CACHE_KEY));
  if (projectsCache) {
    return JSON.parse(projectsCache);
  }
  return [];
}

/**
 * @typedef {(value: string, input: string) => boolean} SearchStrategy
 */
/**
 *
 * @type {{matchFromStart: SearchStrategy, keywordIncludes: SearchStrategy, matchIncludes: SearchStrategy}}
 */
const searchStrategies = {
  matchFromStart(value, input) {
    function format(v) {
      return v.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    return format(value).startsWith(format(input));
  },
  matchIncludes(value, input) {
    function format(v) {
      return v.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    return format(value).includes(format(input));
  },
  keywordIncludes(value, input) {
    const keywords = input
      .replace(/[^a-z0-9]/g, ' ')
      .split(' ')
      .filter(function(v) {
        return !!v;
      });
    return keywords.every((keyword) => {
      return searchStrategies.matchIncludes(value, keyword);
    });
  },
};

function debug() {
  alfy.output([
    {
      title: 'Debug alfred-open-in-vscode',
      subtitle: `node.version=${process.version}`,
    },
  ]);
}

/**
 * @param {Array<{name: string, absolutePath: string}>} projects
 * @param {string} input
 * @returns {Array<{name: string, absolutePath: string}>}
 */
function search(projects, input) {
  if (input) {
    const searchResultsByStrategy = [];
    const searchStrategyNames = [
      'matchFromStart',
      'matchIncludes',
      'keywordIncludes',
    ];
    projects.forEach(function (project) {
      for (let i = 0; i < searchStrategyNames.length; i++) {
        const searchStrategy = searchStrategies[searchStrategyNames[i]];
        if (searchStrategy(project.name, alfy.input)) {
          searchResultsByStrategy[i] = searchResultsByStrategy[i] || [];
          searchResultsByStrategy[i].push(project);
          return;
        }
      }
    });
    return searchResultsByStrategy.reduce(function (all, searchResults) {
      return [...all, ...searchResults];
    }, []);
  }
  return projects;
}

function main() {
  if (alfy.input === 'DEBUG') {
    return debug();
  }

  const projects = getProjects();
  const searchResults = search(projects, alfy.input);

  const output = searchResults.map(function ({ name, absolutePath }) {
    return {
      title: name,
      uid: absolutePath,
      subtitle: absolutePath,
      arg: absolutePath,
      autocomplete: name,
      type: /** @type {'file'} */('file'),
    };
  });

  alfy.output(output, { rerunInterval: 1 });
  updateProjectsCache();
}

main();
