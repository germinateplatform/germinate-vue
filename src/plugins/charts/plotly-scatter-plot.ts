import type { UserSelection } from '@/components/widgets/selections/HighlightSelection.vue'

import Plotly from 'plotly.js/lib/core'
import { uuidv4 } from '@/plugins/util'

export type ClickHandler = (dbId: number) => void
export type SelectionHandler = (dbIds: number[]) => void

export interface ScatterPlotConfig {
  swapAxes: boolean
  colors: string[]
  userSelection?: UserSelection
  width?: number
  height?: number
  darkMode: boolean
  xColumn: string
  yColumn: string
  element: HTMLElement
  clickHandler?: ClickHandler
  selectionHandler?: SelectionHandler
  groups?: { [index: string]: string }
}

export interface ScatterPlotParams {
  swapAxes?: boolean
  colors?: string[]
  userSelection?: UserSelection
  width?: number
  height?: number
  darkMode: boolean
  xColumn: string
  yColumn: string
  element: HTMLElement
  clickHandler?: ClickHandler
  selectionHandler?: SelectionHandler
  groups?: { [index: string]: string }
}

const symbolList = ['circle', 'square', 'diamond', 'cross', 'x', 'triangle-up', 'triangle-down', 'triangle-left', 'triangle-right', 'triangle-ne', 'triangle-se', 'triangle-sw', 'triangle-nw', 'pentagon', 'hexagon', 'hexagon2', 'octagon', 'star', 'hexagram', 'star-triangle-up', 'star-triangle-down', 'star-square', 'star-diamond', 'diamond-tall', 'diamond-wide', 'hourglass', 'bowtie']

const highlightFilter: { [index: string]: (dp: any, value: string) => boolean } = {
  'group': (dp: any, value: string) => dp.groups ? JSON.parse(dp.groups).includes(value) : false,
  'dataset': (dp: any, value: string) => dp.dataset_id === value,
  'plot': (dp: any, value: string) => `${dp.trial_row}|${dp.trial_column}` === value,
  'taxonomies': (dp: any, value: string) => dp.taxonomy === value,
  'germplasm': (dp: any, value: string) => dp.name === value,
  'reps': (dp: any, value: string) => dp.rep === value,
  'treatments': (dp: any, value: string) => dp.treatments_description === value,
  'year': (dp: any, value: string) => dp.year === value,
}

const highlightOppositeFilter: { [index: string]: (dp: any, nonMatchValues: string[]) => boolean } = {
  'group': (dp: any, nonMatchValues: string[]) => dp.groups ? !JSON.parse(dp.groups).some((g: string) => nonMatchValues.includes(g)) : true,
  'dataset': (dp: any, nonMatchValues: string[]) => !nonMatchValues.includes(dp.dataset_id),
  'plot': (dp: any, nonMatchValues: string[]) => !nonMatchValues.includes(`${dp.trial_row}|${dp.trial_column}`),
  'taxonomies': (dp: any, nonMatchValues: string[]) => !nonMatchValues.includes(dp.taxonomy),
  'germplasm': (dp: any, nonMatchValues: string[]) => !nonMatchValues.includes(dp.name),
  'reps': (dp: any, nonMatchValues: string[]) => !nonMatchValues.includes(dp.rep),
  'treatments': (dp: any, nonMatchValues: string[]) => !nonMatchValues.includes(dp.treatments_description),
  'year': (dp: any, nonMatchValues: string[]) => !nonMatchValues.includes(dp.year),
}

export class ScatterPlot {
  config: ScatterPlotConfig

  constructor (config: ScatterPlotParams) {
    this.config = Object.assign({
      colors: ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
      width: Math.min(window.innerHeight, Math.min(config.element.offsetWidth, window.innerWidth)),
      height: Math.min(window.innerHeight, Math.min(config.element.offsetWidth, window.innerWidth)),
      swapAxes: false,
    }, config)
  }

  create (rows: any[]) {
    const layout: any = {
      autosize: true,
      bargap: 0,
      margin: { t: 65, autoexpand: true },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      width: this.config.width,
      height: this.config.height,
      hovermode: 'closest',
      dragmode: 'select',
      legend: {
        bgcolor: 'rgba(0,0,0,0)',
        orientation: 'h',
        font: { color: this.config.darkMode ? 'white' : 'black' },
      },
      xaxis: {
        domain: [0, 0.95],
        showgrid: false,
        showline: true,
        title: { text: this.config.xColumn, font: { color: this.config.darkMode ? 'white' : 'black' } },
        tickfont: { color: this.config.darkMode ? 'white' : 'black' },
      },
      xaxis2: {
        domain: [0.95, 1],
        showgrid: false,
        showticklabels: false,
        zeroline: false,
      },
      yaxis: {
        domain: [0, 0.95],
        showgrid: false,
        showline: true,
        title: { text: this.config.yColumn, font: { color: this.config.darkMode ? 'white' : 'black' } },
        tickfont: { color: this.config.darkMode ? 'white' : 'black' },
      },
      yaxis2: {
        domain: [0.95, 1],
        showgrid: false,
        showticklabels: false,
        zeroline: false,
      },
      barmode: 'overlay',
    }

    const data: any[] = []
    const [xAxis, yAxis] = this.config.swapAxes ? [this.config.yColumn, this.config.xColumn] : [this.config.xColumn, this.config.yColumn]

    const type = this.config.userSelection?.type

    if (this.config.userSelection && type) {
      const selectedItems = [...this.config.userSelection.selectedItems]

      let ids = rows.filter(row => highlightOppositeFilter[type](row, selectedItems)).map(r => this.extractValue(r, 'dbId'))
      ids = ids.map(i => `${i}-${uuidv4()}`)
      const names = rows.filter(row => highlightOppositeFilter[type](row, selectedItems)).map(r => this.extractValue(r, 'name'))
      const x = rows.filter(row => highlightOppositeFilter[type](row, selectedItems)).map(r => this.extractValue(r, this.config.xColumn))
      const y = rows.filter(row => highlightOppositeFilter[type](row, selectedItems)).map(r => this.extractValue(r, this.config.yColumn))

      this.addData(data, ids, names, x, y, 0, 'N/A')

      selectedItems.forEach((item, index) => {
        let ids = rows.filter(row => highlightFilter[type](row, item)).map(r => this.extractValue(r, 'dbId'))
        ids = ids.map(i => `${i}-${uuidv4()}`)
        const names = rows.filter(row => highlightFilter[type](row, item)).map(r => this.extractValue(r, 'name'))
        const x = rows.filter(row => highlightFilter[type](row, item)).map(r => this.extractValue(r, this.config.xColumn))
        const y = rows.filter(row => highlightFilter[type](row, item)).map(r => this.extractValue(r, this.config.yColumn))

        this.addData(data, ids, names, x, y, index + 1, item)
      })
    } else {
      let ids = this.unpack(rows, 'dbId')
      ids = ids.map(i => `${i}-${uuidv4()}`)
      const names = this.unpack(rows, 'name')
      const x = this.unpack(rows, xAxis)
      const y = this.unpack(rows, yAxis)

      this.addData(data, ids, names, x, y, 0, undefined)
    }

    const config = {
      modeBarButtonsToRemove: ['toImage'],
      responsive: true,
      displaylogo: false,
    }

    try {
      Plotly.purge(this.config.element)
    } catch {
      // Do nothing here
    }

    // @ts-ignore
    Plotly.react(this.config.element, data, layout, config)
      .then(element => {
        element.on('plotly_selected', eventData => {
          if (!eventData || (eventData.points.length === 0)) {
            Plotly.restyle(element, { selectedpoints: null })
            // @ts-ignore
            Plotly.relayout(element, { selections: [] })

            if (this.config.selectionHandler) {
              this.config.selectionHandler([])
            }
          } else {
            if (this.config.selectionHandler) {
              // @ts-ignore
              const mapped = eventData.points.map(p => Number.parseInt(p.id.split('-')[0])).filter((value, index, self) => self.indexOf(value) === index)

              this.config.selectionHandler(mapped)
            }
          }
        })

        if (this.config.clickHandler) {
          element.on('plotly_click', data => {
            if (data.points.length > 0) {
              // @ts-ignore
              this.config.clickHandler?.(Number.parseInt(data.points[0].id.split('-')[0]))
            }
          })
        }
      })

    // this.on('plotly_selected', eventData => {
    //   if (!eventData || (eventData.points.length === 0)) {
    //     Plotly.restyle(this, { selectedpoints: null })
    //     Plotly.relayout(this, { selections: [] })

    //     if (onPointsSelected) {
    //       onPointsSelected([])
    //     }
    //   } else {
    //     if (onPointsSelected) {
    //       const mapped = eventData.points.map(p => Number.parseInt(p.id.split('-')[0])).filter((value, index, self) => self.indexOf(value) === index)

    //       onPointsSelected(mapped)
    //     }
    //   }
    // })

    // if (onPointClicked) {
    //   this.on('plotly_click', function (data) {
    //     if (data.points.length > 0) {
    //       onPointClicked(Number.parseInt(data.points[0].id.split('-')[0]))
    //     }
    //   })
    // }

    // if (onColorByStatsLoaded) {
    //   getColorByStats(rows)
    // }
  }

  addData (data: any[], ids: string[], names: string[], x: string[], y: string[], index: number, traceName: string | undefined) {
    data.push({
      x,
      y,
      marker: {
        color: this.config.colors[index % this.config.colors.length],
        symbol: symbolList[index % symbolList.length],
        size: 6,
        opacity: 0.7,
      },
      mode: 'markers',
      name: traceName,
      ids,
      text: names,
      type: 'scattergl',
      unselected: {
        marker: {
          opacity: 0.2,
        },
      },
      showlegend: traceName !== undefined,
    }, {
      x,
      marker: {
        color: this.config.colors[index % this.config.colors.length],
      },
      opacity: 0.5,
      name: traceName,
      type: 'histogram',
      yaxis: 'y2',
      showlegend: false,
    }, {
      y,
      marker: {
        color: this.config.colors[index % this.config.colors.length],
      },
      opacity: 0.5,
      name: traceName,
      type: 'histogram',
      xaxis: 'x2',
      showlegend: false,
    })
  }

  hasData (rows: any[], key: string) {
    const values = rows.map(row => row[key]).filter(v => v !== undefined && v !== null && v !== '')

    if (key === 'Date') {
      return new Set(values).size > 1
    } else {
      return values.length > 0
    }
  }

  unpack (rows: any[], key: string) {
    return rows.map(row => row[key])
  }

  unpackOpposite (rows: any[], key: string, referenceColumn: string, nonMatchValues: string[]) {
    return rows.filter(row => !nonMatchValues.includes(row[referenceColumn])).map(row => this.extractValue(row, key))
  }

  extractValue (row: any, key: string) {
    // return row[key]
    const dataPoint = row[key]
    if (dataPoint === null || dataPoint === undefined || dataPoint === '') {
      return null
    } else {
      let isDate = false

      if (key === 'Date') {
        isDate = true
      } else if (dataPoint.split('-').length === 3 && !Number.isNaN(Date.parse(dataPoint))) {
        isDate = true
      }

      if (isDate) {
        return dataPoint
      } else {
        const value = Number.parseFloat(dataPoint)

        if (Number.isNaN(value)) {
          return dataPoint
        } else {
          return value
        }
      }
    }
  }
}
