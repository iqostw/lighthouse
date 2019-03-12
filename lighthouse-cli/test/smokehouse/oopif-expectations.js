/**
 * @license Copyright 2019 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/**
 * Expected Lighthouse audit values for sites with OOPIFS.
 */
module.exports = [
  {
    requestedUrl: 'http://localhost:10200/oopif.html',
    finalUrl: 'http://localhost:10200/oopif.html',
    audits: {
      'network-requests': {
        details: {
          items: {
            // The page itself only makes a few requests.
            // We want to make sure we are finding the iframe's requests (airhorner) while being flexible enough
            // to allow changes to the live site.
            length: '>10',
          },
        },
      },
    },
  },
];
