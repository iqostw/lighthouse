'use strict';

const JEST_WORKERS = 4;
const STRYKER_WORKERS = 2;

module.exports = function(config) {
  config.set({
    mutator: 'javascript',
    packageManager: 'yarn',
    testRunner: 'command',
    commandRunner: {
      command:
          'yarn tsc -p . && ' +
          `yarn unit-core --maxWorkers=${JEST_WORKERS} --bail`,
    },
    transpilers: [],
    coverageAnalysis: 'off',
    mutate: [
      'lighthouse-core/**/*.js',
      '!lighthouse-core/scripts/**/*.js',
      '!lighthouse-core/test/**/*.js',
    ],
    reporters: ['clear-text', 'progress', 'html'],
    htmlReporter: {
      baseDir: 'coverage/mutation/html',
    },
    // logLevel: 'all',
    timeoutMS: 80000,
    maxConcurrentTestRunners: STRYKER_WORKERS,
  });
};
