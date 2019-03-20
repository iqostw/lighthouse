'use strict';

module.exports = function(config) {
  config.set({
    mutator: 'javascript',
    packageManager: 'yarn',
    testRunner: 'command',
    commandRunner: {command: 'yarn tsc -p . && yarn unit-core --maxWorkers=4 --bail'},
    transpilers: [],
    coverageAnalysis: 'off',
    mutate: [
      'lighthouse-core/config/config.js',
      'lighthouse-core/gather/gather-runner.js',
      'lighthouse-core/runner.js',
    ],
    reporters: ['clear-text', 'progress', 'html'],
    htmlReporter: {
      baseDir: 'coverage/mutation/html',
    },
    clearTextReporter: {logTests: true},
    // logLevel: 'all',
    timeoutMS: 80000,
    maxConcurrentTestRunners: 2,
  });
};
