import type { BaseChartExposed } from '@/components/charts/BaseChart.vue'
import { DEFAULT_PLOTLY_CONFIG } from '@/plugins/util'

export interface PositionClickHandlerPayload {
  chromosome: string
  from: number
  to: number
}

export interface MapChartConfig {
  element: HTMLElement | string
  onPointsSelected?: (data: PositionClickHandlerPayload) => void
  onSelectionCleared?: () => void
  onDistinctChromosomes?: (chromosomes: string[]) => void
  darkMode?: boolean
  colors: string[]
}

export interface MapChartParams {
  element: HTMLElement | string
  onPointsSelected?: (data: PositionClickHandlerPayload) => void
  onSelectionCleared?: () => void
  onDistinctChromosomes?: (chromosomes: string[]) => void
  darkMode?: boolean
  colors?: string[]
}

export class MapChart {
  config: MapChartConfig

  constructor (config: MapChartParams) {
    this.config = Object.assign({
      colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
    }, config)
  }

  create (plotlyWrapper: BaseChartExposed | null, rows: any[]) {
    const unique: { [index: string]: number } = {}
    let distinctChromosomes: string[] = []
    let total = 0
    rows.forEach(row => {
      if (!unique[row.chromosome]) {
        unique[row.chromosome] = 1
        distinctChromosomes.push(row.chromosome)
      } else {
        unique[row.chromosome]++
      }
      total++
    })

    // If it's smaller than 5% of the average chromosome size, don't include it
    const threshold = total / distinctChromosomes.length / 100 * 5

    distinctChromosomes = distinctChromosomes.filter(c => unique[c] > threshold)
    distinctChromosomes.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))

    const data: any[] = []
    const layout = {
      height: distinctChromosomes.length * 100 + 200,
      margin: { autoexpand: true },
      autosize: true,
      // hoversubplots: 'axis',
      hovermode: 'x',
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      selectdirection: 'h',
      dragmode: 'select',
      grid: {
        rows: distinctChromosomes.length,
        columns: 1,
        pattern: 'independent',
        subplots: [],
      },
      legend: {
        bgcolor: 'rgba(0,0,0,0)',
        orientation: 'h',
        font: { color: this.config.darkMode ? 'white' : 'black' },
      },
      xaxis: {
        title: { font: { color: this.config.darkMode ? 'white' : 'black' } },
        tickfont: { color: this.config.darkMode ? 'white' : 'black' },
      },
    }

    distinctChromosomes.forEach((c, i) => {
      const x = this.unpackConditional(rows, 'position', 'chromosome', c)
      let min = Number.MAX_SAFE_INTEGER
      let max = -Number.MAX_SAFE_INTEGER

      x.forEach(function (value) {
        if (value < min) {
          min = value
        }
        if (value > max) {
          max = value
        }
      })

      const axisIndex = (i > 0) ? (i + 1) : ''
      const datum = {
        x,
        type: 'histogram',
        name: c,
        marker: {
          color: this.config.colors[i % this.config.colors.length],
        },
        xaxis: 'x',
        xbins: {
          size: Math.max(1, Math.round((max - min) / 500)),
        },
        yaxis: 'y' + axisIndex,
      }

      data.push(datum)

      // @ts-expect-error
      layout['yaxis' + axisIndex] = {
        title: { text: c, font: { color: this.config.darkMode ? 'white' : 'black' } },
        tickfont: { color: this.config.darkMode ? 'white' : 'black' },
        showgrid: true,
        gridcolor: this.config.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      }

      // @ts-expect-error
      layout.grid.subplots.push(['xy' + axisIndex])
    })

    plotlyWrapper?.react(this.config.element, data, layout, DEFAULT_PLOTLY_CONFIG)
      .then(element => {
        if (element) {
          element.on('plotly_selected', eventData => {
            if (!eventData || (eventData.points.length === 0)) {
              plotlyWrapper?.restyle(element, { selectedpoints: null })
              plotlyWrapper?.relayout(element, { selections: [] })

              if (this.config.onSelectionCleared) {
                this.config.onSelectionCleared()
              }
            } else {
              const chromosome = eventData.points[0].curveNumber

              if (this.config.onPointsSelected) {
                // @ts-expect-error
                this.config.onPointsSelected({ chromosome: distinctChromosomes[chromosome], from: eventData.range.x[0], to: eventData.range.x[1] })
              }
            }
          })
        }
      })

    if (this.config.onDistinctChromosomes) {
      this.config.onDistinctChromosomes(distinctChromosomes)
    }
  }

  unpackConditional (rows: any[], key: string, referenceColumn: string, referenceValue: string) {
    return rows.filter(row => row[referenceColumn] === referenceValue).map(row => +row[key])
  }
}
