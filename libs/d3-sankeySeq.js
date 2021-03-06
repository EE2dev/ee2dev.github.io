(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-interpolate'), require('d3-array'), require('d3-scale')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-interpolate', 'd3-array', 'd3-scale'], factory) :
  (factory((global.d3 = global.d3 || {}),global.d3,global.d3,global.d3));
}(this, function (exports,d3Interpolate,d3Array,d3Scale) { 'use strict';

  function sankeySeq () {
    var sankey = {},
        debugOn = false,
        nodeWidth = 15,
        nodePadding = 8,
        size = [700, 500],
        sequence = [],
        categories = [],
        ky,
        // scaling factor for height of node
    maxValue,
        // the max of all node values
    maxValueSpecified = false,
        // true if maxValue is specified through API
    nodes = [],
        links = [],
        xScale,
        yScale;

    sankey.debugOn = function (_) {
      if (!arguments.length) return debugOn;
      debugOn = _;
      return sankey;
    };

    sankey.nodeWidth = function (_) {
      if (!arguments.length) return nodeWidth;
      nodeWidth = +_;
      return sankey;
    };

    sankey.nodePadding = function (_) {
      if (!arguments.length) return nodePadding;
      nodePadding = +_;
      return sankey;
    };

    sankey.nodes = function (_) {
      if (!arguments.length) return nodes;
      nodes = _;
      return sankey;
    };

    sankey.links = function (_) {
      if (!arguments.length) return links;
      links = _;
      return sankey;
    };

    sankey.sequence = function (_) {
      if (!arguments.length) return sequence;
      sequence = _;
      return sankey;
    };

    sankey.categories = function (_) {
      if (!arguments.length) return categories;
      categories = _;
      return sankey;
    };

    sankey.size = function (_) {
      if (!arguments.length) return size;
      size = _;
      return sankey;
    };

    sankey.xScale = function (_) {
      if (!arguments.length) return xScale;
      xScale = _;
      return sankey;
    };

    sankey.yScale = function (_) {
      if (!arguments.length) return yScale;
      yScale = _;
      return sankey;
    };

    sankey.relayout = function () {
      computeLinkDepths();
      return sankey;
    };

    sankey.link = function () {
      var curvature = .5;

      function link(d) {
        var x0 = d.source.x + d.source.dx,
            x1 = d.target.x,
            xi = d3Interpolate.interpolateNumber(x0, x1),
            x2 = xi(curvature),
            x3 = xi(1 - curvature),
            y0 = d.source.y + d.sy + d.dy / 2,
            y1 = d.target.y + d.ty + d.dy / 2;
        return "M" + x0 + "," + y0 + "C" + x2 + "," + y0 + " " + x3 + "," + y1 + " " + x1 + "," + y1;
      }

      link.curvature = function (_) {
        if (!arguments.length) return curvature;
        curvature = +_;
        return link;
      };

      return link;
    };

    sankey.layout = function () {
      computeNodeLinks();
      computeNodeValues();
      computeNodeSizes(); // new
      computeNodePositions(); // new
      computeLinkDepths();
      return sankey;
    };

    sankey.getNodeHeight = function (value) {
      return value * ky;
    };

    sankey.maxValue = function (value) {
      if (!arguments.length) return maxValue;
      if (value === -1) {
        maxValueSpecified = false;return;
      }
      maxValue = value;
      maxValueSpecified = true;
      return sankey;
    };
    // end of API functions

    // Populate the sourceLinks and targetLinks for each node.
    // Also, if the source and target are not objects, assume they are indices.
    function computeNodeLinks() {
      nodes.forEach(function (node) {
        node.sourceLinks = [];
        node.targetLinks = [];
      });
      links.forEach(function (link) {
        var source = link.source,
            target = link.target;
        if (typeof source === "number") source = link.source = nodes[link.source];
        if (typeof target === "number") target = link.target = nodes[link.target];
        source.sourceLinks.push(link);
        target.targetLinks.push(link);
      });
    }

    // Compute the value (size) of each node by summing the associated links.
    function computeNodeValues() {
      nodes.forEach(function (node) {
        node.value = Math.max(d3Array.sum(node.sourceLinks, value), d3Array.sum(node.targetLinks, value));
      });
    }

    // Compute the y extend of nodes and links
    function computeNodeSizes() {
      maxValue = maxValueSpecified ? maxValue : d3Array.max(nodes, function (d) {
        return d.value;
      });
      // calculate scaling factor ky based on #categories, height, nodePAdding and maxNodeValue
      ky = (size[1] / categories.length - nodePadding) / maxValue;

      if (debugOn) {
        console.log("ky: " + ky);
      }

      nodes.forEach(function (node) {
        node.dy = node.value * ky;
        node.dx = nodeWidth;
      });

      links.forEach(function (link) {
        link.dy = link.value * ky;
      });
    }

    function computeNodePositions() {
      if (debugOn) {
        console.log(size);
      }
      xScale = d3Scale.scalePoint().domain(sequence).range([0, size[0] - nodeWidth]);
      yScale = d3Scale.scalePoint().domain(categories).range([size[1], size[1] / categories.length]);

      nodes.forEach(function (element) {
        element.x = xScale(element.nameX);
        element.y = yScale(element.nameY) - element.dy;

        if (debugOn) {
          console.log("x " + element.nameX + " -> " + xScale(element.nameX));
          console.log("y " + element.nameY + " -> " + xScale(element.nameY));
        }
      });

      if (debugOn) {
        console.log(nodes);
      }
    }

    function computeLinkDepths() {
      nodes.forEach(function (node) {
        node.sourceLinks.sort(ascendingTargetDepth);
        node.targetLinks.sort(ascendingSourceDepth);
      });
      nodes.forEach(function (node) {
        var sy = 0,
            ty = 0;
        node.sourceLinks.forEach(function (link) {
          link.sy = sy;
          sy += link.dy;
        });
        node.targetLinks.forEach(function (link) {
          link.ty = ty;
          ty += link.dy;
        });
      });

      function ascendingSourceDepth(a, b) {
        return a.source.y - b.source.y;
      }

      function ascendingTargetDepth(a, b) {
        return a.target.y - b.target.y;
      }
    }

    function value(link) {
      return link.value;
    }

    return sankey;
  }

  exports.sankeySeq = sankeySeq;

  Object.defineProperty(exports, '__esModule', { value: true });

}));