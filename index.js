/**
 * @since 2019-08-14 02:43
 * @author vivaxy
 */
import path from 'node:path';
import alfy from 'alfy';
import glob from 'fast-glob';

const wds = process.env.wds.split(',');

async function getWds() {
  return (
    await Promise.all(
      wds.map(
        async (wd) =>
          await glob(wd, {
            cwd: '/',
            onlyDirectories: true,
            dot: true,
          }),
      ),
    )
  ).flat();
}

async function updateProjectsCache() {
  const matches = await getWds();

  const projects = (
    await Promise.all(
      matches.map(async function(wd) {
        const names = await glob('*', {
          cwd: wd,
          onlyDirectories: true,
          dot: true,
        });
        return {
          wd,
          names,
        };
      }),
    )
  ).reduce(function(all, wdProject) {
    return [
      ...all,
      ...wdProject.names.map(function(name) {
        return {
          name,
          wd: wdProject.wd,
        };
      }),
    ];
  }, []);
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
      title: 'node version',
      subtitle: process.version,
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
    const absolutePath = path.join(project.wd, project.name);
    return {
      title: project.name,
      uid: absolutePath,
      subtitle: absolutePath,
      arg: absolutePath,
      autocomplete: project.name,
      type: 'file',
    };
  });

  alfy.output(output, { rerunInterval: 1 });
  updateProjectsCache();
}

main();
