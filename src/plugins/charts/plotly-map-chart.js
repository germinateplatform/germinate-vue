/* eslint-disable */
export function plotlyMapChart() {
	var onPointsSelected = null,
		onSelectionCleared = null,
		onDistinctChromosomes = null,
		distinctChromosomes = [],
		colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

	function chart(selection) {
		selection.each(function (rows) {
			var unique = {};
      let total = 0
			rows.forEach(function (row) {
        if (!unique[row.chromosome]) {
          unique[row.chromosome] = 1;
          distinctChromosomes.push(row.chromosome);
        } else {
          unique[row.chromosome]++;
        }
        total++
			});

      // If it's smaller than 5% of the average chromosome size, don't include it
      const threshold = total / distinctChromosomes.length / 100 * 5

      distinctChromosomes = distinctChromosomes.filter(c => unique[c] > threshold)

			var data = [];
			var layout = {
				height: distinctChromosomes.length * 100 + 200,
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
          bgcolor: 'rgba(0,0,0,0)',
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
					name: c,
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
					title: c
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

			if (onDistinctChromosomes) {
				onDistinctChromosomes(distinctChromosomes)
			}
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

	chart.onDistinctChromosomes = function (_) {
		if (!arguments.length) return onDistinctChromosomes;
		onDistinctChromosomes = _;
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