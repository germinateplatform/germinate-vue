/* eslint-disable */
export function plotlyScatterPlot() {
	var colorBy = '',
		markedIdsForColoring = null,
		colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
		height = null,
		width = null,
		xCategory = 'x',
		yCategory = 'y',
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

			var data = [];

			var cats = [];
			if (markedIdsForColoring === null) {
				categories.forEach(function (c) {
					cats.push(c);
				});

				cats.sort()
			} else {
				cats = ['Unmarked', 'Marked']
			}

			for (var i = 0; i < cats.length; i++) {
				var x, y, ids, names;

				if (markedIdsForColoring === null) {
					x = unpackConditional(rows, xCategory, colorBy, cats[i]);
					y = unpackConditional(rows, yCategory, colorBy, cats[i]);
					ids = unpackConditional(rows, 'dbId', colorBy, cats[i]);
					names = unpackConditional(rows, 'name', colorBy, cats[i]);
				} else {
					x = unpackConditionalMarked(rows, xCategory, markedIdsForColoring, cats[i] === 'Marked');
					y = unpackConditionalMarked(rows, yCategory, markedIdsForColoring, cats[i] === 'Marked');
					ids = unpackConditionalMarked(rows, 'dbId', markedIdsForColoring, cats[i] === 'Marked');
					names = unpackConditionalMarked(rows, 'name', markedIdsForColoring, cats[i] === 'Marked');
				}

				ids = ids.map(function (i) {
					return i + "-" + uuidv4();
				});
				data.push({
					x: x,
					y: y,
					marker: {
						color: colors[i % colors.length],
						symbol: symbolList[i % symbolList.length],
						size: 6,
						opacity: 0.7
					},
					mode: 'markers',
					name: cats[i] ? cats[i] : '',
					ids: ids,
					text: names,
					type: 'scattergl',
					unselected: {
						marker: {
							opacity: 0.2
						}
					},
					showlegend: cats[i] !== undefined
				});
				data.push({
					x: x,
					marker: {
						color: colors[i % colors.length]
					},
					opacity: 0.5,
					name: cats[i] ? cats[i] : '',
					type: 'histogram',
					yaxis: 'y2',
					showlegend: false
				});
				data.push({
					y: y,
					marker: {
						color: colors[i % colors.length]
					},
					opacity: 0.5,
					name: cats[i] ? cats[i] : '',
					type: 'histogram',
					xaxis: 'x2',
					showlegend: false
				})
			}

			var layout = {
				autosize: true,
				bargap: 0,
				width: width === null ? this.offsetWidth * 0.75 : width,
				height: height === null ? this.offsetWidth * 0.75 : height,
				hovermode: 'closest',
				dragmode: 'select',
				margin: {t: 65, autoexpand: true},
				xaxis: {
					domain: [0, 0.95],
					showgrid: false,
					showline: true,
					title: xCategory
				},
				xaxis2: {
					domain: [0.95, 1],
					showgrid: false,
					showticklabels: false,
					zeroline: false
				},
				yaxis: {
					domain: [0, 0.95],
					showgrid: false,
					showline: true,
					title: yCategory
				},
				yaxis2: {
					domain: [0.95, 1],
					showgrid: false,
					showticklabels: false,
					zeroline: false
				},
				legend: {
					orientation: 'h'
				},
				barmode: 'overlay'
			};

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
					Plotly.restyle(that, {selectedpoints: [null]});

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

	function unpack(rows, key) {
		return rows.map(function (row) {
			return row[key];
		});
	}

	function unpackConditionalMarked(rows, key, markedIds, isMarked) {
		return rows.filter(function (row) {
			const isDataPointMarked = markedIds.indexOf(parseInt(row.dbId)) !== -1
			return isMarked ? isDataPointMarked : !isDataPointMarked;
		}).map(function (row) {
			if (row[key] === '') {
				return null
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

	function unpackConditional(rows, key, referenceColumn, referenceValue) {
		return rows.filter(function (row) {
			return row[referenceColumn] === referenceValue;
		}).map(function (row) {
			if (row[key] === '') {
				return null
			} else {
				var value = parseFloat(row[key])

				if (isNaN(value)) {
					return row[key];
				} else {
					return value;
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

	chart.markedIdsForColoring = function (_) {
		if (!arguments.length) return markedIdsForColoring;
		markedIdsForColoring = _;
		return chart;
	};

	return chart;
}