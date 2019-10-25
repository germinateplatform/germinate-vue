/*
 *  Copyright 2018 Information and Computational Sciences,
 *  The James Hutton Institute.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
/* eslint-disable */
export function pedigreeChart() {
	var margin = {
			top: 20,
			right: 20,
			bottom: 30,
			left: 50
		},
		width = 960,
		height = 500,
		tooltip = function (d) {
			return null;
		},
		onClick = function (d) {
			// do nothing
		},
		tooltipStyle = "",
		nodeStyle = "",
		edgeStyle = "",
		nodeShape = "rect",
		connections = null,
		interpolate = d3.curveBasis;

	function chart(selection) {
		selection.each(function (data) {

			height = height - margin.bottom - margin.top;
			width = width - margin.left - margin.right;

			// Create a new directed graph
			var graph = new dagreD3.graphlib.Graph().setGraph({});

			function substring(str, len) {
				len = len || 15;

				if (!str || str.length <= len) {
					return str;
				} else {
					var regex = RegExp(".{" + len + "}\\w*", "g");
					return str.match(regex)[0] + "...";
				}
			}

			// Automatically label each of the nodes
			data.forEach(function (state) {
				graph.setNode(state.label, {
					label: substring(state.label),
					labelStyle: "font-size: 8pt; pointer-events: none;",
					object: state,
					style: 'stroke: #333; fill: #fff; rx: 5px; ry: 5px;',
					shape: nodeShape
				});
			});

			if (connections !== null) {
				connections.forEach(function (edge) {
					graph.setEdge(edge.from, edge.to, {
						curve: interpolate,
						style: 'stroke: #333; fill: none; stroke-width: 3px; ' + edge.edgeStyle,
						arrowheadStyle: edge.headStyle
					});
				});
			}

			// Select the svg element, if it exists.
      var svg = d3.select(this).selectAll("svg")
        .data([data]);
      // Otherwise, create the skeletal chart.
      var s = svg.enter().append("svg");
      var gEnter = s
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g");
			var inner = gEnter.append("g");

			// Create the renderer
			var render = new dagreD3.render();

			// Run the renderer. This is what draws the final graph.
			render(inner, graph);

      inner.selectAll("g.node").on("click", onClick);
      
      var xCenterOffset = (s.attr("width") - graph.graph().width) / 2;
      gEnter.attr("transform", "translate(" + xCenterOffset + ", 20)");
      s.attr("height", graph.graph().height + 40);
		});
	}

	chart.margin = function (_) {
		if (!arguments.length) return margin;
		margin = Object.create(_);
		return chart;
	};

	chart.width = function (_) {
		if (!arguments.length) return width;
		width = _;
		return chart;
	};

	chart.height = function (_) {
		if (!arguments.length) return height;
		height = _;
		return chart;
	};

	chart.connections = function (_) {
		if (!arguments.length) return connections;
		connections = Object.create(_);
		return chart;
	};

	chart.tooltip = function (_) {
		if (!arguments.length) return tooltip;
		tooltip = _;
		return chart;
	};

	chart.onClick = function (_) {
		if (!arguments.length) return onClick;
		onClick = _;
		return chart;
	};

	chart.interpolate = function (_) {
		if (!arguments.length) return interpolate;
		interpolate = _;
		return chart;
	};

	chart.nodeStyle = function (_) {
		if (!arguments.length) return nodeStyle;
		nodeStyle = _;
		return chart;
	};

	chart.edgeStyle = function (_) {
		if (!arguments.length) return edgeStyle;
		edgeStyle = _;
		return chart;
	};

	chart.nodeShape = function (_) {
		if (!arguments.length) return nodeShape;
		nodeShape = _;
		return chart;
	};

	chart.tooltipStyle = function (_) {
		if (!arguments.length) return tooltipStyle;
		tooltipStyle = _;
		return chart;
	};

	return chart;
}
