/* eslint-disable */
export function plotlyScatterPlot() {
	var colorBy = {
      column: null,
      ids: null,
      names: null
    },
		colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"],
    colorByOptions = ['dataset_name', 'entity_parent_name', 'Date', 'treatments_description', 'rep', 'trial_site', 'group_ids'],
		height = null,
		width = null,
    darkMode = false,
		xCategory = 'x',
		yCategory = 'y',
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

      var data = [];
      
      data.push({
        x: unpackConditional(rows, xCategory, null, cats[i]),
        y: unpackConditional(rows, yCategory, null, cats[i]),
        name: 'density',
        ncontours: 20,
        colorscale: darkMode ? [[0, 'transparent'], [0.0001, 'black'], [1, 'white']] : [[0, 'transparent'], [0.0001, 'white'], [1, 'black']],
        reversescale: false,
        opacity: 1,
        line: {
          color: darkMode ? 'white' : 'black'
        },
        showscale: false,
        type: 'histogram2dcontour',
        hoverinfo: 'skip',
        fillcolor: 'transparent'
      });

			for (var i = 0; i < cats.length; i++) {
				var x, y, ids, names;

        if (colorBy.column !== null || (colorBy.column === null && colorBy.ids === null && colorBy.names === null)) {
					x = unpackConditional(rows, xCategory, colorBy.column, cats[i]);
					y = unpackConditional(rows, yCategory, colorBy.column, cats[i]);
					ids = unpackConditional(rows, 'dbId', colorBy.column, cats[i]);
					names = unpackConditional(rows, 'name', colorBy.column, cats[i]);
				} else if (colorBy.ids !== null) {
					x = unpackConditionalMarked(rows, xCategory, colorBy.ids, cats[i] === 'Marked');
					y = unpackConditionalMarked(rows, yCategory, colorBy.ids, cats[i] === 'Marked');
					ids = unpackConditionalMarked(rows, 'dbId', colorBy.ids, cats[i] === 'Marked');
					names = unpackConditionalMarked(rows, 'name', colorBy.ids, cats[i] === 'Marked');
				} else if (colorBy.names != null) {
          x = unpackConditionalByName(rows, xCategory, colorBy.names, cats[i] === 'Marked');
					y = unpackConditionalByName(rows, yCategory, colorBy.names, cats[i] === 'Marked');
					ids = unpackConditionalByName(rows, 'dbId', colorBy.names, cats[i] === 'Marked');
					names = unpackConditionalByName(rows, 'name', colorBy.names, cats[i] === 'Marked');
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

      var updatemenus = [
        {
          buttons: [
            {
              args: ['opacity', 0.5, [0]],
              args2: ['opacity', 0, [0]],
              label: 'Toggle contour',
              method: 'restyle'
            }
          ],
          direction: 'left',
          pad: {'r': 10, 't': 10},
          showactive: true,
          type: 'buttons',
          x: 0.1,
          xanchor: 'left',
          y: 1.1,
          yanchor: 'top'
        }
      ]

			var layout = {
				autosize: true,
				bargap: 0,
				width: width === null ? Math.min(this.offsetWidth, window.innerHeight) * 0.95 : width,
				height: height === null ? Math.min(this.offsetWidth, window.innerHeight) * 0.95 : height,
				hovermode: 'closest',
        dragmode: 'select',
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        updatemenus: updatemenus,
				margin: {t: 65, autoexpand: true},
				xaxis: {
					domain: [0, 0.95],
					showgrid: false,
					showline: true,
					title: { text: xCategory, font: { color: darkMode ? 'white' : 'black' } },
          tickfont: { color: darkMode ? 'white' : 'black' }
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
          title: { text: yCategory, font: { color: darkMode ? 'white' : 'black' } },
          tickfont: { color: darkMode ? 'white' : 'black' }
				},
				yaxis2: {
					domain: [0.95, 1],
					showgrid: false,
					showticklabels: false,
					zeroline: false
				},
				legend: {
          bgcolor: 'rgba(0,0,0,0)',
					orientation: 'h',
          font: { color: darkMode ? 'white' : 'black' }
				},
				barmode: 'overlay'
			};

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
  
  function unpackConditionalByName(rows, key, names, isMarked) {
		return rows.filter(function (row) {
			const isDataPointMarked = names.indexOf(row.name.toUpperCase()) !== -1
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

  chart.onColorByStatsLoaded = function (_) {
    if (!arguments.length) return onColorByStatsLoaded;
    onColorByStatsLoaded = _;
    return chart;
  };

	chart.onPointsSelected = function (_) {
		if (!arguments.length) return onPointsSelected;
		onPointsSelected = _;
		return chart;
	};

  chart.darkMode = function (_) {
    if (!arguments.length) return darkMode;
    darkMode = _;
    return chart;
  };

	return chart;
}