/*
 *  Copyright 2019 Information and Computational Sciences,
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
			var categories = new Set();

			var unpacked = unpack(rows, colorBy);
			for (i = 0; i < unpacked.length; i++) {
				categories.add(unpacked[i])
			}

			var dims = Object.keys(rows[0]);
			dims = dims.filter(function (d) {
				return columnsToIgnore.indexOf(d) < 0;
			});

			var data = [];

			var cats = [];
			categories.forEach(function (c) {
				cats.push(c);
			});

			for (var i = 0; i < cats.length; i++) {

				var ids = cats[i] ? unpackConditional(rows, 'dbId', colorBy, cats[i]) : unpack(rows, 'dbId');
				ids = ids.map(function (i) {
					return i + "-" + uuidv4();
				});
				var names = cats[i] ? unpackConditional(rows, 'name', colorBy, cats[i]) : unpack(rows, 'name');

				data.push({
					type: 'splom',
					showupperhalf: false,
					diagonal: {visible: false},
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
							return p.id.split('-')[0];
						});

						onPointsSelected(mapped);
					}
				}
			});

			if (onPointClicked) {
				this.on('plotly_click', function (data) {
					if (data.points.length > 0) {
						onPointClicked(data.points[0]);
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

	function unpackConditional(rows, key, referenceColumn, referenceValue) {
		return rows.filter(function (row) {
			return row[referenceColumn] === referenceValue
		}).map(function (row) {
			return row[key]
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