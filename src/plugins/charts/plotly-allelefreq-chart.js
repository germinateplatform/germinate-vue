/* eslint-disable */
export function plotlyAlleleFreqChart() {
	var width = null,
		height = 600,
		xCategory = '',
		yCategory = '',
		onPointClicked = null,
		widths = [],
		x = '',
		y = '',
		colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

	function chart(selection) {
		selection.each(function (rows) {
			var freqs = unpack(rows, y);

			var max = 0;

			// Get the maximum frequency
			for (var j = 0; j < freqs.length; j++) {
				max = Math.max(max, freqs[j]);
			}

			var data = [];
			var ys = [];
			var barColors = [];
			var text = [];
			var heights = [];
			var barWidths = [];

			var sum = 0;
			for (var i = 0; i < widths.length; i++) {
				sum += widths[i];
				ys.push(widths[i] / 100);
				barColors.push((sum / 100).toFixed(4));
				heights.push(-(max / 40));
				barWidths.push(max / 20);

				if (i > 0) {
					// Bin label
					text.push(barColors[i-1] + ' - ' + barColors[i]);
				} else {
					text.push('0 - ' + ys[i].toFixed(4));
				}
			}

			data.push({
				x: unpack(rows, x),
				y: unpack(rows, y),
				showlegend: false,
				name: xCategory,
				type: 'bar',
				marker: {
					color: colors
				}
			});

			data.push({
				x: ys,
				y: heights,
				width: barWidths,
				orientation: 'h',
				type: 'bar',
				text: text,
				showlegend: false,
				name: '',
				hovertemplate: '%{text}',
				marker: {
					colorscale: [
						['0', '#ff7878'],
						['1', '#78fd78']
					],
					color: barColors,
					line: {
						color: '#333',
						width: 1
					}
				}
			});

			var config = {
				modeBarButtonsToRemove: ['toImage'],
				displayModeBar: true,
				responsive: true,
				displaylogo: false
			};

			var layout = {
				height: height,
				margin: {autoexpand: true},
				autosize: true,
				hovermode: 'closest',
				barmode: 'stacked',
				xaxis: {
					title: xCategory,
					automargin: true,
					range: [0, 1.0]
				},
				yaxis: {
					title: yCategory,
					zeroline: true,
					rangemode: 'tozero',
					automargin: true
				}};

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

	chart.y = function (_) {
		if (!arguments.length) return y;
		y = _;
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

	chart.widths = function (_) {
		if (!arguments.length) return widths;
		widths = _;
		return chart;
	}

	return chart;
}