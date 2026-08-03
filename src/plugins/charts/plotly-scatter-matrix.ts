import Plotly from 'plotly.js/lib/core'
import { uuidv4 } from '@/plugins/util'
import { DEFAULT_CHART_COLORS } from '@/plugins/util/colors'

export type ClickHandler = (dbId: number) => void
export type SelectionHandler = (dbIds: number[]) => void

export interface UserSelection {
  type: string
  selectedItems: string[]
}

export interface ScatterMatrixConfig {
  colors: string[]
  userSelection?: UserSelection
  width?: number
  height?: number
  darkMode: boolean
  columnsToIgnore: string[]
  element: HTMLElement
  clickHandler?: ClickHandler
  selectionHandler?: SelectionHandler
  groups?: { [index: string]: string }
  datasets?: { [index: string]: string }
}

export interface ScatterMatrixParams {
  colors?: string[]
  userSelection?: UserSelection
  width?: number
  height?: number
  darkMode: boolean
  columnsToIgnore: string[]
  element: HTMLElement
  clickHandler?: ClickHandler
  selectionHandler?: SelectionHandler
  groups?: { [index: string]: string }
  datasets?: { [index: string]: string }
}

const symbolList = ['circle', 'square', 'diamond', 'cross', 'x', 'triangle-up', 'triangle-down', 'triangle-left', 'triangle-right', 'triangle-ne', 'triangle-se', 'triangle-sw', 'triangle-nw', 'pentagon', 'hexagon', 'hexagon2', 'octagon', 'star', 'hexagram', 'star-triangle-up', 'star-triangle-down', 'star-square', 'star-diamond', 'diamond-tall', 'diamond-wide', 'hourglass', 'bowtie']

const highlightFilter: { [index: string]: (dp: any, value: string) => boolean } = {
  'group': (dp: any, value: string) => dp.groups ? JSON.parse(dp.groups).includes(value) : false,
  'datasets': (dp: any, value: string) => dp.dataset_ids ? JSON.parse(dp.dataset_ids).includes(+value) : false,
  'plot': (dp: any, value: string) => `${dp.trial_row}|${dp.trial_column}` === value,
  'taxonomies': (dp: any, value: string) => dp.taxonomy === value,
  'germplasm': (dp: any, value: string) => dp.name === value,
  'reps': (dp: any, value: string) => dp.rep === value,
  'treatments': (dp: any, value: string) => dp.treatment === value,
  'year': (dp: any, value: string) => dp.year === value,
}

const highlightOppositeFilter: { [index: string]: (dp: any, nonMatchValues: string[]) => boolean } = {
  'group': (dp: any, nonMatchValues: string[]) => dp.groups ? !JSON.parse(dp.groups).some((g: string) => nonMatchValues.includes(g)) : true,
  'datasets': (dp: any, nonMatchValues: string[]) => dp.dataset_ids ? !JSON.parse(dp.dataset_ids).some((g: string) => nonMatchValues.includes(g)) : true,
  'plot': (dp: any, nonMatchValues: string[]) => !nonMatchValues.includes(`${dp.trial_row}|${dp.trial_column}`),
  'taxonomies': (dp: any, nonMatchValues: string[]) => !nonMatchValues.includes(dp.taxonomy),
  'germplasm': (dp: any, nonMatchValues: string[]) => !nonMatchValues.includes(dp.name),
  'reps': (dp: any, nonMatchValues: string[]) => !nonMatchValues.includes(dp.rep),
  'treatments': (dp: any, nonMatchValues: string[]) => !nonMatchValues.includes(dp.treatment),
  'year': (dp: any, nonMatchValues: string[]) => !nonMatchValues.includes(dp.year),
}

export class ScatterMatrix {
  config: ScatterMatrixConfig

  constructor (config: ScatterMatrixParams) {
    this.config = Object.assign({
      colors: DEFAULT_CHART_COLORS,
      width: config.element.offsetWidth,
      height: config.element.offsetWidth,
    }, config)
  }

  create (rows: any[]) {
    const layout: any = {
      margin: { autoexpand: true },
      autosize: true,
      bargap: 0,
      paper_bgcolor: 'transparent',
      width: this.config.width,
      height: this.config.height,
      plot_bgcolor: this.config.darkMode ? 'rgba(45, 45, 45, 0.3)' : 'rgba(240, 240, 240, 0.3)',
      hovermode: 'closest',
      dragmode: 'select',
      legend: {
        bgcolor: 'rgba(0,0,0,0)',
        orientation: 'h',
        font: { color: this.config.darkMode ? 'white' : 'black' },
      },
    }

    // Reduce dimensions to those actually visible (i.e. remove any that shouldn't be visible)
    const allDims = new Set<string>()
    rows.forEach(r => {
      Object.keys(r).forEach(k => allDims.add(k))
    })
    const visibleDims = [...allDims].filter(d => !this.config.columnsToIgnore.includes(d) && this.hasData(rows, d))

    visibleDims.forEach((d, i) => {
      const id = i === 0 ? '' : ('' + (i + 1))

      layout[`xaxis${id}`] = {
        showline: false,
        zeroline: false,
        ticklen: 2,
        gridcolor: this.config.darkMode ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)',
        tickfont: { size: 10, color: this.config.darkMode ? 'white' : 'black' },
        title: { font: { color: this.config.darkMode ? 'white' : 'black', size: 10 } },
      }
      layout[`yaxis${id}`] = {
        showline: false,
        zeroline: false,
        ticklen: 2,
        gridcolor: this.config.darkMode ? 'rgba(1.0, 1.0, 1.0, 0.1)' : 'rgba(0.0, 0.0, 0.0, 0.1)',
        tickfont: { size: 10, color: this.config.darkMode ? 'white' : 'black' },
        title: { font: { color: this.config.darkMode ? 'white' : 'black', size: 10 } },
      }

      if (d === 'Date') {
        layout[`xaxis${id}`].type = 'date'
        layout[`yaxis${id}`].type = 'date'
        layout[`xaxis${id}`].tickformat = '%Y-%m-%d'
        layout[`yaxis${id}`].tickformat = '%Y-%m-%d'
      }
    })

    const data: any[] = []
    const dimHasData = visibleDims.map(() => false)

    const type = this.config.userSelection?.type
    if (this.config.userSelection && type) {
      const selectedItems = [...this.config.userSelection.selectedItems]

      let ids = rows.filter(row => highlightOppositeFilter[type](row, selectedItems)).map(r => this.extractValue(r, 'dbId'))
      ids = ids.map(i => `${i}-${uuidv4()}`)
      const names = rows.filter(row => highlightOppositeFilter[type](row, selectedItems)).map(r => this.extractValue(r, 'name'))
      data.push({
        type: 'splom',
        showupperhalf: false,
        diagonal: { visible: true },
        dimensions: visibleDims.map((k, kIndex) => {
          const values = rows.filter(row => highlightOppositeFilter[type](row, selectedItems)).map(r => this.extractValue(r, k))
          dimHasData[kIndex] ||= values.some(v => v !== null)

          return {
            label: k,
            values,
          }
        }),
        name: 'N/A',
        text: names,
        ids,
        customdata: names,
        hovertemplate: '%{xaxis.title.text}: %{x}<br>%{yaxis.title.text}: %{y}<br>Germplasm: %{customdata}',
        marker: {
          color: this.config.colors[0 % this.config.colors.length],
          symbol: symbolList[0 % symbolList.length],
          opacity: 0.7,
          size: 6,
        },
      })

      selectedItems.forEach((item, index) => {
        const filtered = rows.filter(row => highlightFilter[type || ''](row, item))

        let name = `&nbsp;${item || 'N/A'}`

        if (type === 'group') {
          name = this.config.groups?.[item] || 'N/A'
        } else if (type === 'datasets' && filtered.length > 0) {
          name = this.config.datasets?.[item] || 'N/A'
        }

        let ids = filtered.map(r => this.extractValue(r, 'dbId'))
        ids = ids.map(i => `${i}-${uuidv4()}`)
        const names = filtered.map(r => this.extractValue(r, 'name'))
        data.push({
          type: 'splom',
          showupperhalf: false,
          diagonal: { visible: true },
          dimensions: visibleDims.map((k, kIndex) => {
            const values = filtered.map(r => this.extractValue(r, k))
            dimHasData[kIndex] ||= values.some(v => v !== null)

            return {
              label: k,
              values,
            }
          }),
          name,
          text: names,
          ids,
          customdata: names,
          hovertemplate: '%{xaxis.title.text}: %{x}<br>%{yaxis.title.text}: %{y}<br>Germplasm: %{customdata}',
          marker: {
            color: this.config.colors[(index + 1) % this.config.colors.length],
            symbol: symbolList[(index + 1) % symbolList.length],
            opacity: 0.7,
            size: 6,
          },
        })
      })
    } else {
      let ids = this.unpack(rows, 'dbId')
      ids = ids.map(i => `${i}-${uuidv4()}`)
      const names = this.unpack(rows, 'name')
      data.push({
        type: 'splom',
        showupperhalf: false,
        diagonal: { visible: true },
        dimensions: visibleDims.map((k, kIndex) => {
          const values = this.unpack(rows, k)
          dimHasData[kIndex] ||= values.some(v => v !== null)

          return {
            label: k,
            values,
          }
        }),
        name: 'All data',
        text: names,
        ids,
        customdata: names,
        hovertemplate: '%{xaxis.title.text}: %{x}<br>%{yaxis.title.text}: %{y}<br>Germplasm: %{customdata}',
        marker: {
          color: this.config.colors[0],
          symbol: symbolList[0],
          opacity: 0.7,
          size: 6,
        },
      })
    }

    if (dimHasData.some(k => !k)) {
      data.sort((a, b) => {
        const countA = a.dimensions.map((d: any) => d.values.filter((v: any) => v !== undefined && v !== null).length).reduce((x: number, y: number) => x + y, 0)
        const countB = b.dimensions.map((d: any) => d.values.filter((v: any) => v !== undefined && v !== null).length).reduce((x: number, y: number) => x + y, 0)

        return Math.sign(countB - countA)
      })
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

    console.log(data)

    // @ts-ignore
    Plotly.react(this.config.element, data, layout, config)
      .then(element => {
        console.log('element', element)
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
