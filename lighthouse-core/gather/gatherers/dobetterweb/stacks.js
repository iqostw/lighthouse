/**
 * @license Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */

/**
 * @fileoverview Gathers a list of detected JS libraries and their versions.
 */

'use strict';

const JSLibraries = require('./js-libraries');

class Stacks extends JSLibraries {
  /**
   * @param {LH.Gatherer.PassContext} passContext
   * @return {Promise<LH.Artifacts['Stacks']>}
   */
  // @ts-ignore
  async afterPass(passContext) {
    const libs = await super.afterPass(passContext);

    return libs.map(lib => ({
      detector: 'js',
      id: lib.npmPkgName || lib.name.toLowerCase(),
      name: lib.name,
      version: lib.version,
      npm: lib.npmPkgName,
    }));
  }
}

module.exports = Stacks;
