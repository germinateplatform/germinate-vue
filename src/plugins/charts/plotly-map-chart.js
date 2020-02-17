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
export function plotlyMapChart() {
	var onPointsSelected = null,
	  onSelectionCleared = null,
		distinctChromosomes = [],
		colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

	function chart(selection) {
		selection.each(function (rows) {
			var unique = {};
			rows.forEach(function (row) {
				if( typeof(unique[row.chromosome]) == "undefined"){
					distinctChromosomes.push(row.chromosome);
				}
				unique[row.chromosome] = 0;
			});

			var data = [];
			var layout = {
				height: distinctChromosomes.length * 100,
				margin: {autoexpand: true},
				autosize: true,
				selectdirection: 'h',
				dragmode: 'select',
				grid: {
					rows: distinctChromosomes.length,
					columns: 1,
					pattern: 'independent',
					subplots: []
				},
				legend: {
					orientation: 'h'
				}
			};

			distinctChromosomes.forEach(function (c, i) {
				var x = unpackConditional(rows, "position", "chromosome", c);
				var min = Number.MAX_SAFE_INTEGER;
				var max = -Number.MAX_SAFE_INTEGER;

				x.forEach(function (value) {
					if (value < min) {
						min = value;
					}
					if (value > max) {
						max = value
					}
				});

				var datum = {
					x: x,
					type: 'histogram',
					name: 'Chr ' + c,
					marker: {
						color: colors[i % colors.length]
					},
					xaxis: 'x',
					xbins: {
						size: Math.max(1, Math.round((max-min)/500))
					}
				};

				var axisIndex = (i > 0) ? (i+1) : '';
				datum.yaxis = 'y' + axisIndex;
				data.push(datum);

				layout['yaxis' + axisIndex] = {
					title: 'Chr ' + c
				}

				layout.grid.subplots.push(['xy' + axisIndex]);
			});

			var config = {
				modeBarButtonsToRemove: ['toImage'],
				displayModeBar: true,
				responsive: true,
				displaylogo: false
			};

			Plotly.newPlot(this, data, layout, config);

			var that = this;

			this.on('plotly_selected', function (eventData) {
				if (!eventData || (eventData.points.length < 1)) {
					Plotly.restyle(that, {selectedpoints: null});

					if (onSelectionCleared)
						onSelectionCleared()
				} else {
					var chromosome = eventData.points[0].curveNumber;

					if (onPointsSelected)
						onPointsSelected(distinctChromosomes[chromosome], eventData.range.x[0], eventData.range.x[1]);
				}
			});
		});
	}

	function unpackConditional(rows, key, referenceColumn, referenceValue) {
		return rows.filter(function (row) {
			return row[referenceColumn] === referenceValue
		}).map(function (row) {
			return +row[key]
		})
	}

	chart.colors = function (_) {
		if (!arguments.length) return colors;
		colors = _;
		return chart;
	};

	chart.onPointsSelected = function (_) {
		if (!arguments.length) return onPointsSelected;
		onPointsSelected = _;
		return chart;
	};

	chart.onSelectionCleared = function (_) {
		if (!arguments.length) return onSelectionCleared;
		onSelectionCleared = _;
		return chart;
	};

	return chart;
}