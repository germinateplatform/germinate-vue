import { DEFAULT_PLOTLY_CONFIG } from '@/plugins/util'

import type { BaseChartExposed } from '@/components/charts/BaseChart.vue'
import type { Datum } from 'plotly.js/lib/core'

export interface ClickHandlerPayload {
  x: Datum
  trace: string
}
export type ClickHandler = (data: ClickHandlerPayload) => void

export interface BarChartConfig {
  height: number
  xCategory: string
  yCategory: string
  xLabels?: string[][]
  groupBy?: string
  darkMode: boolean
  element: HTMLElement | string
  onPointClicked?: ClickHandler
  mode: string
  x: string
  columnsToIgnore: string[]
  colors: string[]
}

export interface BarChartParams {
  height?: number
  xCategory: string
  yCategory: string
  xLabels?: string[][]
  groupBy?: string
  darkMode: boolean
  element: HTMLElement | string
  onPointClicked?: ClickHandler
  mode?: string
  x: string
  columnsToIgnore: string[]
  colors?: string[]
}

export class BarChart {
  config: BarChartConfig

  constructor (config: BarChartParams) {
    this.config = Object.assign({
      height: 600,
      mode: 'traces',
      colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
    }, config)
  }

  create (plotlyWrapper: BaseChartExposed | null, rows: any[]) {
    let dims = Object.keys(rows[0])
    dims = dims.filter(d => d !== this.config.x && !this.config.columnsToIgnore.includes(d))

    const data = []
    let xValues: string[] = []

    if (this.config.groupBy) {
      const set = new Set(this.unpack(rows, this.config.x))
      xValues = [...set]

      const groupBySet = new Set(this.unpack(rows, this.config.groupBy))
      const groupByValues = [...groupBySet]

      if (groupByValues.length < 2) {
        xValues = []
      } else {
        for (let i = 0; i < groupByValues.length; i++) {
          data.push({
            x: xValues,
            y: this.unpackConditional(rows, dims[0], this.config.groupBy, groupByValues[i]),
            name: groupByValues[i] || 'N/A',
            type: 'bar',
            marker: {
              color: this.config.mode === 'traces' ? this.config.colors[i % this.config.colors.length] : this.config.colors,
            },
          })
        }
      }
    }

    if (xValues.length === 0) {
      xValues = this.unpack(rows, this.config.x)
      for (let i = 0; i < dims.length; i++) {
        data.push({
          x: xValues,
          y: this.unpack(rows, dims[i]),
          name: dims[i],
          type: 'bar',
          marker: {
            color: this.config.mode === 'traces' ? this.config.colors[i % this.config.colors.length] : this.config.colors,
          },
        })
      }
    }

    const config = {
      ...DEFAULT_PLOTLY_CONFIG,
      displayModeBar: false,
    }

    let xTickLabels: string[] | null = null
    let xTickValues: (string | null)[] | null = null

    if (this.config.xLabels) {
      ({ xTickLabels, xTickValues } = this.setTicks(xValues))
    }

    const layout = {
      height: this.config.height,
      hovermode: 'x',
      barmode: 'group',
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      xaxis: {
        title: { text: this.config.xCategory, font: { color: this.config.darkMode ? 'white' : 'black' } },
        tickfont: { color: this.config.darkMode ? 'white' : 'black' },
        tickmode: xTickLabels ? 'array' : 'auto',
        ticktext: xTickLabels,
        tickvals: xTickValues,
        automargin: true,
        fixedrange: true,
      },
      yaxis: {
        title: { text: this.config.yCategory, font: { color: this.config.darkMode ? 'white' : 'black' } },
        tickfont: { color: this.config.darkMode ? 'white' : 'black' },
        automargin: true,
        fixedrange: true,
        showgrid: true,
        gridcolor: this.config.darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      },
      legend: {
        bgcolor: 'rgba(0,0,0,0)',
        orientation: 'h',
        x: 0,
        y: 1.1,
        font: { color: this.config.darkMode ? 'white' : 'black' },
      },
    }

    if (this.config.groupBy) {
      layout.barmode = 'group'
    }

    plotlyWrapper?.react(this.config.element, data, layout, config)
      .then(element => {
        if (element && this.config.onPointClicked) {
          const dragLayer = document.getElementsByClassName('nsewdrag')[0]

          element.on('plotly_hover', () => {
            // @ts-expect-error
            dragLayer.style.cursor = 'pointer'
          })
          element.on('plotly_unhover', () => {
            // @ts-expect-error
            dragLayer.style.cursor = ''
          })
          element.on('plotly_click', data => {
            if (data && data.points && data.points.length > 0 && data.event && data.event.button === 0) {
              this.config.onPointClicked?.({
                x: data.points[0].x,
                trace: data.points[0].data.name,
              })
            }
          })
        }
      })
  }

  setTicks (xValues: string[]) {
    const potentialLabels: string[][] = []

    this.config.xLabels?.forEach(scale => {
      scale.forEach((l, i) => {
        if (i > potentialLabels.length - 1) {
          potentialLabels.push([l])
        } else {
          potentialLabels[i].push(l)
        }
      })
    })

    const xTickLabels = potentialLabels.map(lbs => lbs.join('<br>'))

    const xTickValues = potentialLabels.map(lbs => {
      return lbs.map(lb => xValues.includes(lb) ? lb : undefined).find(lb => lb !== undefined) || null
    })

    return {
      xTickLabels,
      xTickValues,
    }
  }

  unpack (rows: any[], key: string) {
    return rows.map(row => row[key])
  }

  unpackConditional (rows: any[], key: string, referenceColumn: string, referenceValue: string[]) {
    return rows.filter(row => row[referenceColumn] === referenceValue).map(row => row[key])
  }
}
