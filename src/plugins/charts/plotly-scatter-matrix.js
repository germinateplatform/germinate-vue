/* eslint-disable */
export function plotlyScatterMatrix() {
	var colorBy = '',
		colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
		height = null,
		width = null,
		columnsToIgnore = [],
		onPointClicked = null,
		onPointsSelected = null;

	function chart(selection) {
		selection.each(function (rows) {
			var symbolList = [ "circle", "square", "diamond", "cross", "x", "triangle-up", "triangle-down", "triangle-left", "triangle-right", "triangle-ne", "triangle-se", "triangle-sw", "triangle-nw", "pentagon", "hexagon", "hexagon2", "octagon", "star", "hexagram", "star-triangle-up", "star-triangle-down", "star-square", "star-diamond", "diamond-tall", "diamond-wide", "hourglass", "bowtie" ]

			var categories = new Set();

			var unpacked = unpack(rows, colorBy);
			for (i = 0; i < unpacked.length; i++) {
				categories.add(unpacked[i])
			}

			var dims = Object.keys(rows[0]);
			dims = dims.filter(d => {
				return columnsToIgnore.indexOf(d) < 0 && hasData(rows, d);
			});

			var data = [];

			var cats = [];
			categories.forEach(function (c) {
				cats.push(c);
			});

			cats.sort()

			for (var i = 0; i < cats.length; i++) {
				var ids = cats[i] ? unpackConditional(rows, 'dbId', colorBy, cats[i]) : unpack(rows, 'dbId');
				ids = ids.map(function (i) {
					return i + "-" + uuidv4();
				});
				var names = cats[i] ? unpackConditional(rows, 'name', colorBy, cats[i]) : unpack(rows, 'name');

				data.push({
					type: 'splom',
					showupperhalf: false,
					diagonal: {visible: true},
					dimensions: dims.map(function (k) {
						return {
							label: k,
							values: unpackConditional(rows, k, colorBy, cats[i])
						}
					}),
					name: cats[i],
					text: names,
					ids: ids,
					marker: {
						color: colors[i % colors.length],
						symbol: symbolList[i % symbolList.length],
						opacity: 0.7,
						size: 6
					}
				});
			}

			var layout = {
				margin: {autoexpand: true},
				autosize: true,
				bargap: 0,
				width: width,
				height: height === null ? this.offsetWidth : height,
				plot_bgcolor: 'rgba(240,240,240, 0.95)',
				hovermode: 'closest',
				dragmode: 'select',
				legend: {
					orientation: 'h'
				}
			};

			dims.forEach(function (d, i) {
				var id = i === 0 ? '' : ('' + (i + 1));

				layout['xaxis' + id] = {
					showline: false,
					zeroline: false,
					gridcolor: '#fff',
					ticklen: 2,
					tickfont: {size: 10},
					titlefont: {size: 10}
				};
				layout['yaxis' + id] = {
					showline: false,
					zeroline: false,
					gridcolor: '#fff',
					ticklen: 2,
					tickfont: {size: 10},
					titlefont: {size: 10}
				};
			});

			var config = {
				modeBarButtonsToRemove: ['toImage'],
				displayModeBar: true,
				responsive: true,
				displaylogo: false
			};

			Plotly.plot(this, data, layout, config);

			var that = this;

			this.on('plotly_selected', function (eventData) {
				if (!eventData || (eventData.points.length < 1)) {
					Plotly.restyle(that, {selectedpoints: null});

					if (onPointsSelected)
						onPointsSelected(null);
				} else {
					if (onPointsSelected) {
						var mapped = eventData.points.map(function (p) {
							return parseInt(p.id.split('-')[0]);
						}).filter((value, index, self) => {
							return self.indexOf(value) === index
						});

						onPointsSelected(mapped);
					}
				}
			});

			if (onPointClicked) {
				this.on('plotly_click', function (data) {
					if (data.points.length > 0) {
						onPointClicked(parseInt(data.points[0].id.split('-')[0]));
					}
				});
			}
		});
	}

	function hasData(rows, key) {
		var values = rows.map(function (row) {
			return row[key]
		}).filter(function (v) {
			return v !== undefined && v !== null && v !== ''
		});

		return values.length > 0
	}

	function unpack(rows, key) {
		return rows.map(function (row) {
			return row[key];
		});
	}

	function unpackConditional(rows, key, referenceColumn, referenceValue) {
		return rows.filter(function (row) {
			return row[referenceColumn] === referenceValue;
		}).map(function (row) {
			if (row[key] === '') {
				return NaN
			} else {
				if (key === 'Date') {
					return row[key];
				} else {
					var value = parseFloat(row[key])

					if (isNaN(value)) {
						return row[key];
					} else {
						return value;
					}
				}
			}
		})
	}

	function uuidv4() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	chart.colorBy = function (_) {
		if (!arguments.length) return colorBy;
		colorBy = _;
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

	chart.onPointClicked = function (_) {
		if (!arguments.length) return onPointClicked;
		onPointClicked = _;
		return chart;
	};

	chart.onPointsSelected = function (_) {
		if (!arguments.length) return onPointsSelected;
		onPointsSelected = _;
		return chart;
	};

	chart.columnsToIgnore = function (_) {
		if (!arguments.length) return columnsToIgnore;
		columnsToIgnore = _;
		return chart;
	};

	return chart;
}