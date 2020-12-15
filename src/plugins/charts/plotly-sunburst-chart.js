/* eslint-disable */
export function plotlySunburstChart() {
	var height = 800,
    onLeafClicked = null,
		colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

	function chart(selection) {
		selection.each(function (rows) {
			

			var data = [{
				labels: rows.labels,
        parents: rows.parents,
        values: rows.values,
        type: 'sunburst',
        marker: {line: {width: 1}},
        branchvalues: 'total',
        textinfo: 'label+value'
			}];

			var config = {
				modeBarButtonsToRemove: ['toImage'],
				displayModeBar: false,
				responsive: true,
				displaylogo: false
			};

			var layout = {
				height: height,
				margin: {l: 20, r: 20, b: 20, t: 20},
				xaxis: {
					automargin: true
				},
				yaxis: {
					automargin: true
				},
				legend: {
					orientation: 'h'
        },
        sunburstcolorway: colors,
        extendsunburstcolorway: true
			};

      Plotly.newPlot(this, data, layout, config);
      
      if (onLeafClicked) {
        this.on('plotly_sunburstclick', function (data) {
          if (data.nextLevel === undefined && data.points && data.points.length > 0) {
            let path = data.points[0].currentPath.split('/')
            if (path.length > 0 && path[0] === '') {
              path.shift()
            }
            path.pop()

            path.push(data.points[0].label)

            onLeafClicked(path)
          }
        });
      }
		});
	}

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

	chart.onLeafClicked = function (_) {
		if (!arguments.length) return onLeafClicked;
		onLeafClicked = _;
		return chart;
	};

	return chart;
}