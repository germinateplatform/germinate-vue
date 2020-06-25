/* eslint-disable */
export function plotlyBarChart() {
	var width = 1280,
		height = 600,
		xCategory = '',
		yCategory = '',
		onPointClicked = null,
		mode = 'traces',
		x = '',
		colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

	function chart(selection) {
		selection.each(function (rows) {
			var dims = Object.keys(rows[0]);
			dims = dims.filter(function (d) {
				return d !== x;
			});

			var data = [];

			for (var i = 0; i < dims.length; i++) {
				data.push({
					x: unpack(rows, x),
					y: unpack(rows, dims[i]),
					name: dims[i],
					type: 'bar',
					marker: {
						color: mode === 'traces' ? colors[i % colors.length] : colors
					}
				})
			}

			var config = {
				modeBarButtonsToRemove: ['toImage'],
				displayModeBar: true,
				responsive: true,
				displaylogo: false
			};

			var layout = {
				height: height,
				hovermode: 'closest',
				barmode: 'group',
				xaxis: {
					title: xCategory,
					automargin: true
				},
				yaxis: {
					title: yCategory,
					automargin: true
				},
				legend: {
					orientation: 'h'
				}
			};

			Plotly.newPlot(this, data, layout, config);

			if (onPointClicked) {
				var dragLayer = this.getElementsByClassName('nsewdrag')[0];

				this.on('plotly_hover', function(data){
					dragLayer.style.cursor = 'pointer'
				});

				this.on('plotly_unhover', function(data){
					dragLayer.style.cursor = ''
				});

				this.on('plotly_click', function (data) {
					if (data && data.points && data.points.length > 0 && data.event && data.event.button === 0) {
						onPointClicked(data.points[0].x);
					}
				});
			}
		});
	}

	function unpack(rows, key) {
		return rows.map(function (row) {
			return row[key];
		});
	}

	chart.x = function (_) {
		if (!arguments.length) return x;
		x = _;
		return chart;
	};

	chart.onPointClicked = function (_) {
		if (!arguments.length) return onPointClicked;
		onPointClicked = _;
		return chart;
	};

	chart.xCategory = function (_) {
		if (!arguments.length) return xCategory;
		xCategory = _;
		return chart;
	};

	chart.yCategory = function (_) {
		if (!arguments.length) return yCategory;
		yCategory = _;
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

	chart.colors = function (_) {
		if (!arguments.length) return colors;
		colors = _;
		return chart;
	};

	chart.mode = function (_) {
		if (!arguments.length) return mode;
		mode = _;
		return chart;
	};

	return chart;
}