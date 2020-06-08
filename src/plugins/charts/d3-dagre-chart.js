/* eslint-disable */
export function pedigreeChart(dagreD3) {
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
					class: state.class,
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

			// Set up zoom support
			var zoom = d3.behavior.zoom().on('zoom', function () {
				inner.attr('transform', 'translate(' + d3.event.translate + ')' +
					'scale(' + d3.event.scale + ')');
			});
			// svg.call(zoom);

			// Create the renderer
			var render = new dagreD3.render();

			// Run the renderer. This is what draws the final graph.
			render(inner, graph);

      inner.selectAll("g.node").on("click", onClick);
      
			// Center the dag
			var zoomScale = 1;
			// Get Dagre Graph dimensions
			var graphWidth = graph.graph().width + 80;
			var graphHeight = graph.graph().height + 80;
			// Get SVG dimensions

			// Calculate applicable scale for zoom
			zoomScale = Math.max( Math.min(width / graphWidth, height / graphHeight));

			var translate = [(width/2) - ((graphWidth*zoomScale)/2), 0];
			zoom.translate(translate);
			zoom.scale(zoomScale);
			zoom.event(inner);

			// Handle zooming only when the SVG has focus, otherwise don't zoom.
			svg.on("focus", function (e) {
				svg.call(zoom);
			});

			svg.on("blur", function (e) {
				svg.on('.zoom', null);
			});
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
