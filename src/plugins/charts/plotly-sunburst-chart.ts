import type { BaseChartExposed } from '@/components/charts/BaseChart.vue'
import { DEFAULT_PLOTLY_CONFIG } from '@/plugins/util'

export interface SunburstChartConfig {
  element: HTMLElement | string
  height: number
  onLeafClicked?: (path: string[]) => void
  darkMode?: boolean
  colors: string[]
}

export interface SunburstChartParams {
  element: HTMLElement | string
  height?: number
  onLeafClicked?: (path: string[]) => void
  darkMode?: boolean
  colors?: string[]
}

export interface SunburstData {
  labels: string[]
  parents: string[]
  values: number[]
}

export class SunburstChart {
  config: SunburstChartConfig

  constructor (config: SunburstChartParams) {
    this.config = Object.assign({
      colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
      height: 800,
    }, config)
  }

  create (plotlyWrapper: BaseChartExposed | null, rows: SunburstData) {
    const data = [{
      labels: rows.labels,
      parents: rows.parents,
      values: rows.values,
      type: 'sunburst',
      marker: { line: { width: 1 } },
      branchvalues: 'total',
      textinfo: 'label+value',
    }]

    const config = {
      ...DEFAULT_PLOTLY_CONFIG,
      displayModeBar: false,
    }

    const layout = {
      height: this.config.height,
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      margin: { l: 20, r: 20, b: 20, t: 20 },
      xaxis: {
        automargin: true,
      },
      yaxis: {
        automargin: true,
      },
      legend: {
        bgcolor: 'rgba(0,0,0,0)',
        orientation: 'h',
        font: { color: this.config.darkMode ? 'white' : 'black' },
      },
      sunburstcolorway: this.config.colors,
      extendsunburstcolorway: true,
    }

    // Plotly.purge(this)
    plotlyWrapper?.react(this.config.element, data, layout, config)
      .then(element => {
        if (element && this.config.onLeafClicked) {
          element.on('plotly_sunburstclick', data => {
            if (data.nextLevel === undefined && data.points && data.points.length > 0) {
              // @ts-expect-error
              const path = data.points[0].currentPath.split('/')
              if (path.length > 0 && path[0] === '') {
                path.shift()
              }
              path.pop()

              path.push(data.points[0].label)

              this.config.onLeafClicked?.(path)
            }
          })
        }
      })
  }
}
