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

export class MapHeatmap {
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

    const fontColor = this.config.darkMode ? 'white' : 'black'

    // Collect positions per chromosome and the global position range
    const positions = distinctChromosomes.map(c => this.unpackConditional(rows, 'position', 'chromosome', c))
    let globalMin = Number.MAX_SAFE_INTEGER
    let globalMax = -Number.MAX_SAFE_INTEGER
    positions.forEach(xs => xs.forEach(v => {
      if (v < globalMin) {
        globalMin = v
      }
      if (v > globalMax) {
        globalMax = v
      }
    }))

    // One bin size for ALL chromosomes so colors are comparable between rows
    const binSize = Math.max(1, Math.ceil((globalMax - globalMin) / 500))

    const data: any[] = []
    let maxCount = 1

    const xStart = Math.floor(globalMin / binSize) * binSize
    const xEnd = (Math.floor(globalMax / binSize) + 1) * binSize

    const layout: any = {
      height: distinctChromosomes.length * 70 + 150,
      margin: { autoexpand: true },
      autosize: true,
      hovermode: 'closest',
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
      xaxis: {
        title: { text: 'Position', font: { color: fontColor } },
        tickfont: { color: fontColor },
        range: [xStart, xEnd],
        autorange: false,
      },
      legend: {
        orientation: 'h',
      },
    }

    distinctChromosomes.forEach((c, i) => {
      const xs = positions[i]

      // Bin the markers
      let minBin = Number.MAX_SAFE_INTEGER
      let maxBin = -Number.MAX_SAFE_INTEGER
      xs.forEach(v => {
        const b = Math.floor(v / binSize)
        if (b < minBin) {
          minBin = b
        }
        if (b > maxBin) {
          maxBin = b
        }
      })

      const counts = new Array(maxBin - minBin + 1).fill(0)
      xs.forEach(v => {
        counts[Math.floor(v / binSize) - minBin]++
      })
      const centers = counts.map((_, k) => (minBin + k + 0.5) * binSize)
      maxCount = Math.max(maxCount, ...counts)

      const axisIndex = (i > 0) ? (i + 1) : ''

      // Trace 2i: the heatmap (a single row)
      data.push({
        type: 'heatmap',
        name: c,
        x: centers,
        y: [0],
        z: [counts],
        coloraxis: 'coloraxis',
        xaxis: 'x',
        yaxis: 'y' + axisIndex,
        xgap: 0,
        ygap: 0,
        hovertemplate: `${c}<br>Position: %{x}<br>Markers: %{z}<extra></extra>`,
      })

      // Trace 2i+1: invisible scatter so box-select works (heatmaps don't support selection)
      data.push({
        type: 'scatter',
        mode: 'markers',
        x: centers,
        y: centers.map(() => 0),
        showlegend: false,
        hoverinfo: 'skip',
        marker: { opacity: 0, size: 20 },
        selected: { marker: { opacity: 0 } },
        unselected: { marker: { opacity: 0 } },
        xaxis: 'x',
        yaxis: 'y' + axisIndex,
      })

      layout['yaxis' + axisIndex] = {
        title: { text: c, font: { color: fontColor } },
        range: [-0.5, 0.5],
        showticklabels: false,
        tickmode: 'array',
        tickvals: [],
        ticks: '',
        ticklen: 0,
        showgrid: false,
        zeroline: false,
        fixedrange: true,
      }

      layout.grid.subplots.push(['xy' + axisIndex])
    })

    // One shared color scale across all chromosomes
    layout.coloraxis = {
      cmin: 0,
      cmax: maxCount,
      colorscale: 'Viridis',
      colorbar: {
        orientation: 'h',
        title: { text: 'Markers / bin', font: { color: fontColor }, side: 'top' },
        tickfont: { color: fontColor },
        thickness: 12,
        lenmode: 'fraction',
        len: 0.4,
        x: 0.5,
        xanchor: 'center',
        y: -0.15,
        yanchor: 'top',
      },
    }

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
              // Two traces per chromosome (heatmap + selection scatter)
              const chromosome = Math.floor(eventData.points[0].curveNumber / 2)

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
