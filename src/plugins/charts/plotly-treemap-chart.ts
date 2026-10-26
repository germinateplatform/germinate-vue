import type { BaseChartExposed } from '@/components/charts/BaseChart.vue'
import { DEFAULT_PLOTLY_CONFIG } from '@/plugins/util'

export interface TreemapChartConfig {
  element: HTMLElement | string
  height: number
  onLeafClicked?: (path: string[]) => void
  darkMode?: boolean
  colors: string[]
}

export interface TreemapChartParams {
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

export class TreemapChart {
  config: TreemapChartConfig

  constructor (config: TreemapChartParams) {
    this.config = Object.assign({
      colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
      height: 800,
    }, config)
  }

  create (plotlyWrapper: BaseChartExposed | null, rows: SunburstData) {
    const data = [{
      type: 'treemap',
      branchvalues: 'total',
      textinfo: 'label+value+percent parent+percent entry',
      labels: rows.labels,
      parents: rows.parents,
      values: rows.values,
      pathbar: { visible: true },
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
      treemapcolorway: this.config.colors,
      extendtreemapcolorway: true,
    }

    // Plotly.purge(this)
    plotlyWrapper?.react(this.config.element, data, layout, config)
      .then(element => {
        if (element && this.config.onLeafClicked) {
          // @ts-expect-error
          element.on('plotly_treemapclick', data => {
            if (data.points && data.points.length > 0 && data.nextLevel === data.points[0].parent) {
              const parts: string[] = []

              data.points[0].parent.split('|').map((p: any) => p.trim()).forEach((p: any) => {
                if (!parts.includes(p)) {
                  parts.push(p)
                }
              })

              data.points[0].label.split('|').map((p: any) => p.trim()).forEach((p: any) => {
                if (!parts.includes(p)) {
                  parts.push(p)
                }
              })

              this.config.onLeafClicked?.(parts)
            }
          })
        }
      })
  }
}
