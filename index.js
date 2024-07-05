/**
 * @since 2019-08-14 02:43
 * @author vivaxy
 */
import path from 'node:path';
import alfy from 'alfy';
import { getProjectsDirectories } from './utils/get-projects-directories.js';

async function updateProjectsCache() {
  const projectsDirectories = await getProjectsDirectories(process.env.projects);
  const projects = projectsDirectories.map(function (directory) {
    return {
      name: path.basename(directory),
      absolutePath: directory,
    };
  })
  alfy.cache.set('projects', JSON.stringify(projects));
}

function getProjects() {
  const projectsCache = alfy.cache.get('projects');
  if (projectsCache) {
    return JSON.parse(projectsCache);
  }
  return [];
}

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

function main() {
  if (alfy.input === 'DEBUG') {
    return debug()
  }

  const projects = getProjects();
  const searchResultsByStrategy = [];
  const searchStrategyNames = [
    'matchFromStart',
    'matchIncludes',
    'keywordIncludes',
  ];

  projects.forEach(function(project) {
    for (let i = 0; i < searchStrategyNames.length; i++) {
      const searchStrategy = searchStrategies[searchStrategyNames[i]];
      if (searchStrategy(project.name, alfy.input)) {
        searchResultsByStrategy[i] = searchResultsByStrategy[i] || [];
        searchResultsByStrategy[i].push(project);
        return;
      }
    }
  });

  const items = searchResultsByStrategy.reduce(function(all, searchResults) {
    return [...all, ...searchResults];
  }, []);

  const output = items.map(function(project) {
    const { name, absolutePath } = project
    return {
      title: name,
      uid: absolutePath,
      subtitle: absolutePath,
      arg: absolutePath,
      autocomplete: name,
      type: 'file',
    };
  });

  alfy.output(output, { rerunInterval: 1 });
  updateProjectsCache();
}

main();
