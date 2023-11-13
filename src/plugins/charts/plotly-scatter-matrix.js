import { uuidv4 } from '@/mixins/util'

export function plotlyScatterMatrix (Plotly) {
  let colorBy = {
    column: null,
    ids: null,
    names: null
  }
  let colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']
  const colorByOptions = ['dataset_name', 'entity_parent_name', 'taxonomy', 'Date', 'treatments_description', 'rep', 'block', 'trial_row', 'trial_column', 'trial_site', 'location', 'group_ids']
  let height = null
  let width = null
  let darkMode = false
  let columnsToIgnore = []
  let onPointClicked = null
  let onPointsSelected = null
  let onColorByStatsLoaded = null

  function chart (selection) {
    selection.each(function (rows) {
      const symbolList = ['circle', 'square', 'diamond', 'cross', 'x', 'triangle-up', 'triangle-down', 'triangle-left', 'triangle-right', 'triangle-ne', 'triangle-se', 'triangle-sw', 'triangle-nw', 'pentagon', 'hexagon', 'hexagon2', 'octagon', 'star', 'hexagram', 'star-triangle-up', 'star-triangle-down', 'star-square', 'star-diamond', 'diamond-tall', 'diamond-wide', 'hourglass', 'bowtie']

      let cats = []
      if (colorBy.column !== null || (colorBy.column === null && colorBy.ids === null && colorBy.names === null)) {
        const categories = new Set()

        const unpacked = unpack(rows, colorBy.column)
        for (let i = 0; i < unpacked.length; i++) {
          categories.add(unpacked[i])
        }

        categories.forEach(c => cats.push(c))

        cats.sort()
      } else {
        cats = ['Unmarked', 'Marked']
      }

      let dims = Object.keys(rows[0])
      dims = dims.filter(d => columnsToIgnore.indexOf(d) < 0 && hasData(rows, d))

      const data = []

      let requiresSortingToFixMissingDimension = false

      if (colorBy.column !== null || (colorBy.column === null && colorBy.ids === null && colorBy.names === null)) {
        for (let i = 0; i < cats.length; i++) {
          let ids = cats[i] ? unpackConditional(rows, 'dbId', colorBy.column, cats[i]) : unpack(rows, 'dbId')
          ids = ids.map(i => `${i}-${uuidv4()}`)
          const names = cats[i] ? unpackConditional(rows, 'name', colorBy.column, cats[i]) : unpack(rows, 'name')

          data.push({
            type: 'splom',
            showupperhalf: false,
            diagonal: { visible: true },
            dimensions: dims.map(k => {
              const values = unpackConditional(rows, k, colorBy.column, cats[i])
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
          })
        }
      } else if (colorBy.ids !== null) {
        for (let i = 0; i < cats.length; i++) {
          let ids = unpackConditionalMarked(rows, 'dbId', colorBy.ids, cats[i] === 'Marked')
          ids = ids.map(i => `${i}-${uuidv4()}`)
          const names = unpackConditionalMarked(rows, 'name', colorBy.ids, cats[i] === 'Marked')

          data.push({
            type: 'splom',
            showupperhalf: false,
            diagonal: { visible: true },
            dimensions: dims.map(k => {
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
          })
        }
      } else if (colorBy.names !== null) {
        for (let i = 0; i < cats.length; i++) {
          let ids = unpackConditionalByName(rows, 'dbId', colorBy.names, cats[i] === 'Marked')
          ids = ids.map(i => `${i}-${uuidv4()}`)
          const names = unpackConditionalByName(rows, 'name', colorBy.names, cats[i] === 'Marked')

          data.push({
            type: 'splom',
            showupperhalf: false,
            diagonal: { visible: true },
            dimensions: dims.map(k => {
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
          })
        }
      }

      if (requiresSortingToFixMissingDimension) {
        data.sort((a, b) => {
          const countA = a.dimensions.map(d => d.values.filter(v => v !== null).length).reduce((x, y) => x + y, 0)
          const countB = b.dimensions.map(d => d.values.filter(v => v !== null).length).reduce((x, y) => x + y, 0)

          return Math.sign(countB - countA)
        })
      }

      const layout = {
        margin: { autoexpand: true },
        autosize: true,
        bargap: 0,
        paper_bgcolor: 'transparent',
        width: width,
        height: height === null ? this.offsetWidth : height,
        plot_bgcolor: darkMode ? 'rgba(45, 45, 45, 0.3)' : 'rgba(240, 240, 240, 0.3)',
        hovermode: 'closest',
        dragmode: 'select',
        legend: {
          bgcolor: 'rgba(0,0,0,0)',
          orientation: 'h',
          font: { color: darkMode ? 'white' : 'black' }
        }
      }

      dims.forEach((d, i) => {
        const id = i === 0 ? '' : ('' + (i + 1))

        layout[`xaxis${id}`] = {
          showline: false,
          zeroline: false,
          ticklen: 2,
          gridcolor: darkMode ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)',
          tickfont: { size: 10, color: darkMode ? 'white' : 'black' },
          title: { font: { color: darkMode ? 'white' : 'black', size: 10 } }
        }
        layout[`yaxis${id}`] = {
          showline: false,
          zeroline: false,
          ticklen: 2,
          gridcolor: darkMode ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)',
          tickfont: { size: 10, color: darkMode ? 'white' : 'black' },
          title: { font: { color: darkMode ? 'white' : 'black', size: 10 } }
        }

        if (d === 'Date') {
          layout[`xaxis${id}`].type = 'date'
          layout[`yaxis${id}`].type = 'date'
          layout[`xaxis${id}`].tickformat = '%Y-%m-%d'
          layout[`yaxis${id}`].tickformat = '%Y-%m-%d'
        }
      })

      const config = {
        modeBarButtonsToRemove: ['toImage'],
        displayModeBar: true,
        responsive: true,
        displaylogo: false
      }

      Plotly.purge(this)
      Plotly.newPlot(this, data, layout, config)

      this.on('plotly_selected', eventData => {
        if (!eventData || (eventData.points.length < 1)) {
          Plotly.restyle(this, { selectedpoints: null })

          if (onPointsSelected) {
            onPointsSelected(null)
          }
        } else {
          if (onPointsSelected) {
            const mapped = eventData.points.map(p => parseInt(p.id.split('-')[0])).filter((value, index, self) => self.indexOf(value) === index)

            onPointsSelected(mapped)
          }
        }
      })

      if (onPointClicked) {
        this.on('plotly_click', function (data) {
          if (data.points.length > 0) {
            onPointClicked(parseInt(data.points[0].id.split('-')[0]))
          }
        })
      }

      if (onColorByStatsLoaded) {
        getColorByStats(rows)
      }
    })
  }

  async function getColorByStats (rows) {
    const statsResult = {}

    colorByOptions.forEach(o => {
      statsResult[o] = unpackDistinct(rows, o).length
    })

    onColorByStatsLoaded(statsResult)
  }

  function hasData (rows, key) {
    const values = rows.map(row => row[key]).filter(v => v !== undefined && v !== null && v !== '')

    if (key === 'Date') {
      return [...new Set(values)].length > 1
    } else {
      return values.length > 0
    }
  }

  function unpackDistinct (rows, key) {
    return [...new Set(unpack(rows, key))]
  }

  function unpack (rows, key) {
    return rows.map(row => row[key])
  }

  function unpackConditionalMarked (rows, key, markedIds, isMarked) {
    return rows.filter(row => {
      const isDataPointMarked = markedIds.indexOf(parseInt(row.dbId)) !== -1
      return isMarked ? isDataPointMarked : !isDataPointMarked
    }).map(row => extractValue(row, key))
  }

  function unpackConditional (rows, key, referenceColumn, referenceValue) {
    return rows.filter(row => row[referenceColumn] === referenceValue).map(row => extractValue(row, key))
  }

  function unpackConditionalByName (rows, key, names, isMarked) {
    return rows.filter(row => {
      const isDataPointMarked = names.indexOf(row.name.toUpperCase()) !== -1
      return isMarked ? isDataPointMarked : !isDataPointMarked
    }).map(row => extractValue(row, key))
  }

  function extractValue (row, key) {
    return row[key]
    // const dataPoint = row[key]
    // if (dataPoint === null || dataPoint === undefined || dataPoint === '') {
    //   return null
    // } else {
    //   let isDate = false

    //   if (key === 'Date') {
    //     isDate = true
    //   } else if (dataPoint.split('-').length === 3 && !isNaN(Date.parse(dataPoint))) {
    //     isDate = true
    //   }

    //   if (isDate) {
    //     return dataPoint;
    //   } else {
    //     var value = parseFloat(dataPoint)

    //     if (isNaN(value)) {
    //       return dataPoint;
    //     } else {
    //       return value;
    //     }
    //   }
    // }
  }

  chart.colorBy = (_) => {
    if (!arguments.length) {
      return colorBy
    }
    colorBy = _

    if (colorBy.names) {
      colorBy.names = colorBy.names.map(n => n.toUpperCase())
    }

    return chart
  }

  chart.width = (_) => {
    if (!arguments.length) {
      return width
    }
    width = _
    return chart
  }

  chart.height = (_) => {
    if (!arguments.length) {
      return height
    }
    height = _
    return chart
  }

  chart.colors = (_) => {
    if (!arguments.length) {
      return colors
    }
    colors = _
    return chart
  }

  chart.onPointClicked = (_) => {
    if (!arguments.length) {
      return onPointClicked
    }
    onPointClicked = _
    return chart
  }

  chart.onPointsSelected = (_) => {
    if (!arguments.length) {
      return onPointsSelected
    }
    onPointsSelected = _
    return chart
  }

  chart.onColorByStatsLoaded = (_) => {
    if (!arguments.length) {
      return onColorByStatsLoaded
    }
    onColorByStatsLoaded = _
    return chart
  }

  chart.columnsToIgnore = (_) => {
    if (!arguments.length) {
      return columnsToIgnore
    }
    columnsToIgnore = _
    return chart
  }

  chart.darkMode = (_) => {
    if (!arguments.length) {
      return darkMode
    }
    darkMode = _
    return chart
  }

  return chart
}
