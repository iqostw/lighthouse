/**
 * @license Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

const makeComputedArtifact = require('../computed-artifact.js');
const LanternMetric = require('./lantern-metric.js');
const BaseNode = require('../../lib/dependency-graph/base-node.js');

/** @typedef {BaseNode.Node} Node */
/** @typedef {import('../../lib/dependency-graph/cpu-node')} CPUNode */
/** @typedef {import('../../lib/dependency-graph/network-node')} NetworkNode */

class LanternFirstContentfulPaint extends LanternMetric {
  /**
   * @return {LH.Gatherer.Simulation.MetricCoefficients}
   */
  static get COEFFICIENTS() {
    return {
      intercept: 0,
      optimistic: 0.5,
      pessimistic: 0.5,
    };
  }

  /**
   *
   * @param {Node} graph
   * @param {number} fcpTs
   * @param {function(NetworkNode):boolean} networkFilter
   * @param {function(CPUNode):boolean=} cpuFilter
   * @return {{possiblyRenderBlockingScriptUrls: Set<string>, actuallyRenderBlockingScriptUrls: Set<string>, blockingCpuNodeIds: Set<string>}}
   */
  static getBlockingCpuData(graph, fcpTs, networkFilter, cpuFilter) {
    /** @type {Array<CPUNode>} */
    const cpuNodes = [];
    graph.traverse(node => {
      if (node.type === BaseNode.TYPES.CPU && node.startTime <= fcpTs) {
        cpuNodes.push(node);
      }
    });

    cpuNodes.sort((a, b) => a.startTime - b.startTime);

    // A script is *possibly* render blocking if it finished loading before FCP
    const possiblyRenderBlockingScriptUrls = LanternMetric.getScriptUrls(graph, node => {
      return node.endTime <= fcpTs && networkFilter(node);
    });

    // A script is *actually* render blocking if it finished loading before FCP *and* its
    // EvaluateScript task finished before FCP as well.
    /** @type {Set<string>} */
    const actuallyRenderBlockingScriptUrls = new Set();
    const blockingCpuNodeIds = new Set();
    for (const url of possiblyRenderBlockingScriptUrls) {
      for (const cpuNode of cpuNodes) {
        if (cpuNode.isEvaluateScriptFor(new Set([url]))) {
          actuallyRenderBlockingScriptUrls.add(url);
          blockingCpuNodeIds.add(cpuNode);
          break;
        }
      }
    }

    const firstLayout = cpuNodes.find(node => node.didPerformLayout());
    if (firstLayout) blockingCpuNodeIds.add(firstLayout.id);
    const firstPaint = cpuNodes.find(node => node.childEvents.some(e => e.name === 'Paint'));
    if (firstPaint) blockingCpuNodeIds.add(firstPaint.id);
    const firstParse = cpuNodes.find(node => node.childEvents.some(e => e.name === 'ParseHTML'));
    if (firstParse) blockingCpuNodeIds.add(firstParse.id);

    if (cpuFilter) cpuNodes.filter(cpuFilter).forEach(node => blockingCpuNodeIds.add(node.id));

    return {possiblyRenderBlockingScriptUrls, actuallyRenderBlockingScriptUrls, blockingCpuNodeIds};
  }

  /**
   * @param {Node} dependencyGraph
   * @param {number} fcpTs
   * @param {function(NetworkNode):boolean} blockingScriptFilter
   * @param {function(CPUNode):boolean=} cpuNodeFilter
   * @return {Node}
   */
  static getFirstPaintBasedGraph(dependencyGraph, fcpTs, blockingScriptFilter, cpuNodeFilter) {
    const {
      possiblyRenderBlockingScriptUrls,
      actuallyRenderBlockingScriptUrls,
      blockingCpuNodeIds,
    } = this.getBlockingCpuData(dependencyGraph, fcpTs, blockingScriptFilter, cpuNodeFilter);

    return dependencyGraph.cloneWithRelationships(node => {
      if (node.type === BaseNode.TYPES.NETWORK) {
        // Exclude all nodes that ended after FCP (except for the main document which we always consider necessary)
        if (node.endTime > fcpTs && !node.isMainDocument()) return false;

        const url = node.record.url;
        if (possiblyRenderBlockingScriptUrls.has(url))
          return actuallyRenderBlockingScriptUrls.has(url);
        return node.hasRenderBlockingPriority();
      } else {
        // If it's a CPU node, just check if it was blocking.
        return blockingCpuNodeIds.has(node.id);
      }
    });
  }

  /**
   * @param {Node} dependencyGraph
   * @param {LH.Artifacts.TraceOfTab} traceOfTab
   * @return {Node}
   */
  static getOptimisticGraph(dependencyGraph, traceOfTab) {
    return this.getFirstPaintBasedGraph(
      dependencyGraph,
      traceOfTab.timestamps.firstContentfulPaint,
      node => node.hasRenderBlockingPriority() && node.initiatorType !== 'script'
    );
  }

  /**
   * @param {Node} dependencyGraph
   * @param {LH.Artifacts.TraceOfTab} traceOfTab
   * @return {Node}
   */
  static getPessimisticGraph(dependencyGraph, traceOfTab) {
    return this.getFirstPaintBasedGraph(dependencyGraph, traceOfTab.timestamps.firstContentfulPaint, node =>
      node.hasRenderBlockingPriority()
    );
  }
}

module.exports = makeComputedArtifact(LanternFirstContentfulPaint);
