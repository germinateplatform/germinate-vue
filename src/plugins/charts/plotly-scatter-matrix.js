/* eslint-disable */
export function plotlyScatterMatrix() {
	var colorBy = {
      column: null,
      ids: null,
      names: null
    },
		colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
    colorByOptions = ['dataset_name', 'entity_parent_name', 'Date', 'treatments_description', 'trial_site', 'group_ids'],
		height = null,
		width = null,
		columnsToIgnore = [],
		onPointClicked = null,
		onPointsSelected = null,
    onColorByStatsLoaded = null;

	function chart(selection) {
		selection.each(function (rows) {
			var symbolList = [ "circle", "square", "diamond", "cross", "x", "triangle-up", "triangle-down", "triangle-left", "triangle-right", "triangle-ne", "triangle-se", "triangle-sw", "triangle-nw", "pentagon", "hexagon", "hexagon2", "octagon", "star", "hexagram", "star-triangle-up", "star-triangle-down", "star-square", "star-diamond", "diamond-tall", "diamond-wide", "hourglass", "bowtie" ]

      var cats = [];
      if (colorBy.column !== null || (colorBy.column === null && colorBy.ids === null && colorBy.names === null)) {
        var categories = new Set();

        var unpacked = unpack(rows, colorBy.column);
        for (i = 0; i < unpacked.length; i++) {
          categories.add(unpacked[i])
        }

        categories.forEach(function (c) {
          cats.push(c);
        });

        cats.sort()
      } else {
        cats = ['Unmarked', 'Marked']
      }

			var dims = Object.keys(rows[0]);
			dims = dims.filter(d => {
				return columnsToIgnore.indexOf(d) < 0 && hasData(rows, d);
			});

			var data = [];

      let requiresSortingToFixMissingDimension = false

			if (colorBy.column !== null || (colorBy.column === null && colorBy.ids === null && colorBy.names === null)) {
				for (var i = 0; i < cats.length; i++) {
					var ids = cats[i] ? unpackConditional(rows, 'dbId', colorBy.column, cats[i]) : unpack(rows, 'dbId');
					ids = ids.map(function (i) {
						return i + "-" + uuidv4();
					});
					var names = cats[i] ? unpackConditional(rows, 'name', colorBy.column, cats[i]) : unpack(rows, 'name');

					data.push({
						type: 'splom',
						showupperhalf: false,
						diagonal: {visible: true},
						dimensions: dims.map(function (k) {
              let values = unpackConditional(rows, k, colorBy.column, cats[i]);
              if (values.length > 0 && values.filter(v => v !== null).length < 1) {
                requiresSortingToFixMissingDimension = true
              }
							return {
								label: k,
								values: values
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
			} else if (colorBy.ids !== null) {
				for (var i = 0; i < cats.length; i++) {
					var ids = unpackConditionalMarked(rows, 'dbId', colorBy.ids, cats[i] === 'Marked');
					ids = ids.map(function (i) {
						return i + "-" + uuidv4();
					});
					var names = unpackConditionalMarked(rows, 'name', colorBy.ids, cats[i] === 'Marked');

					data.push({
						type: 'splom',
						showupperhalf: false,
						diagonal: {visible: true},
						dimensions: dims.map(function (k) {
							return {
								label: k,
								values: unpackConditionalMarked(rows, k, colorBy.ids, cats[i] === 'Marked')
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
			} else if (colorBy.names !== null) {
				for (var i = 0; i < cats.length; i++) {
					var ids = unpackConditionalByName(rows, 'dbId', colorBy.names, cats[i] === 'Marked');
					ids = ids.map(function (i) {
						return i + "-" + uuidv4();
					});
					var names = unpackConditionalByName(rows, 'name', colorBy.names, cats[i] === 'Marked');

					data.push({
						type: 'splom',
						showupperhalf: false,
						diagonal: {visible: true},
						dimensions: dims.map(function (k) {
							return {
								label: k,
								values: unpackConditionalByName(rows, k, colorBy.names, cats[i] === 'Marked')
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
			}

      if (requiresSortingToFixMissingDimension) {
        data.sort((a, b) => {
          const countA = a.dimensions.map(d => d.values.filter(v => v !== null).length).reduce((x, y) => x + y, 0)
          const countB = b.dimensions.map(d => d.values.filter(v => v !== null).length).reduce((x, y) => x + y, 0)

          return Math.sign(countB - countA)
        })
      }

			var layout = {
				margin: {autoexpand: true},
				autosize: true,
				bargap: 0,
				width: width,
				height: height === null ? this.offsetWidth : height,
				plot_bgcolor: 'rgba(240, 240, 240, 0.3)',
				hovermode: 'closest',
				dragmode: 'select',
				legend: {
          bgcolor: 'rgba(0,0,0,0)',
					orientation: 'h'
				}
			};

			dims.forEach(function (d, i) {
				var id = i === 0 ? '' : ('' + (i + 1));

				layout['xaxis' + id] = {
					showline: false,
					zeroline: false,
          ticklen: 2,
					tickfont: {size: 10},
					titlefont: {size: 10}
				};
				layout['yaxis' + id] = {
					showline: false,
					zeroline: false,
          ticklen: 2,
					tickfont: {size: 10},
					titlefont: {size: 10}
				};

				if (d === 'Date') {
					layout['xaxis' + id].type = 'date'
					layout['yaxis' + id].type = 'date'
					layout['xaxis' + id].tickformat = '%Y-%m-%d'
					layout['yaxis' + id].tickformat = '%Y-%m-%d'
				}
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

      if (onColorByStatsLoaded) {
        getColorByStats(rows)
      }
		});
	}

  async function getColorByStats(rows) {
    const statsResult = {}

    colorByOptions.forEach(o => {
      statsResult[o] = unpackDistinct(rows, o).length
    })

    onColorByStatsLoaded(statsResult)
  }

	function hasData(rows, key) {
		var values = rows.map(function (row) {
			return row[key]
		}).filter(function (v) {
			return v !== undefined && v !== null && v !== ''
		});

    if (key === 'Date') {
      return [...new Set(values)].length > 1
    } else {
  		return values.length > 0
    }
	}

  function unpackDistinct(rows, key) {
    return [...new Set(unpack(rows, key))]
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
			return extractValue(row, key)
		})
	}

	function unpackConditional(rows, key, referenceColumn, referenceValue) {
		return rows.filter(function (row) {
			return row[referenceColumn] === referenceValue;
		}).map(function (row) {
			return extractValue(row, key)
		})
  }

  function unpackConditionalByName(rows, key, names, isMarked) {
		return rows.filter(function (row) {
			const isDataPointMarked = names.indexOf(row.name.toUpperCase()) !== -1
			return isMarked ? isDataPointMarked : !isDataPointMarked;
		}).map(function (row) {
			return extractValue(row, key)
		})
	}
  
  function extractValue(row, key) {
    const dataPoint = row[key]
    if (dataPoint === null || dataPoint === undefined || dataPoint === '') {
      return null
    } else {
      let isDate = false

      if (key === 'Date') {
        isDate = true
      } else if (dataPoint.split('-').length === 3 && !isNaN(Date.parse(dataPoint))) {
        isDate = true
      }

      if (isDate) {
        return dataPoint;
      } else {
        var value = parseFloat(dataPoint)

        if (isNaN(value)) {
          return dataPoint;
        } else {
          return value;
        }
      }
    }
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
    
    if (colorBy.names) {
      colorBy.names = colorBy.names.map(n => n.toUpperCase())
    }

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

  chart.onColorByStatsLoaded = function (_) {
    if (!arguments.length) return onColorByStatsLoaded;
    onColorByStatsLoaded = _;
    return chart;
  };

	chart.columnsToIgnore = function (_) {
		if (!arguments.length) return columnsToIgnore;
		columnsToIgnore = _;
		return chart;
	};

	return chart;
}