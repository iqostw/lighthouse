/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/* eslint-env jest */

const path = require('path');
const spawnSync = require('child_process').spawnSync;

const CLI_PATH = path.join(__dirname, '../src/cli.js');

describe('Lighthouse CI CLI', () => {
  describe('collect', () => {
    it(
      'should collect results',
      () => {
        const {stdout = '', stderr = '', status = -1} = spawnSync(CLI_PATH, [
          'collect',
          '--numberOfRuns=2',
          '--auditUrl=chrome://version',
        ]);

        expect(stdout.toString().replace(/fetched at .*/g, 'fetched at <DATE>'))
          .toMatchInlineSnapshot(`
"Would have beaconed LHR to http://localhost:9001/ fetched at <DATE>
Would have beaconed LHR to http://localhost:9001/ fetched at <DATE>
"
`);
        expect(stderr.toString()).toMatchInlineSnapshot(`""`);
        expect(status).toEqual(0);
      },
      20000
    );
  });
});
