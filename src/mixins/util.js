import store from '@/store'
import { event } from 'vue-gtag'

const germinateVersion = '4.4.1'

/**
     * Generates a v4 UUID
     */
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * Gets the table column style. Will either return an empty style or `d-none` depending on whether the column has been hidden or noe.
 * @param {String} tableName The name of the table
 * @param {String} columnKey The name of the column
 * @returns The style that should be applied to this column
 */
const getTableColumnStyle = (tableName, columnKey) => {
  if (store.getters.storeHiddenColumns[tableName]) {
    return (store.getters.storeHiddenColumns[tableName].indexOf(columnKey) !== -1) ? 'd-none' : ''
  } else {
    return ''
  }
}

/**
 * Checks if the page with the given name is available in this configuration.
 * @param {String} name The name of the page to check (refer to router for names)
 */
const isPageAvailable = (name) => {
  if (store.getters.storeServerSettings != null && store.getters.storeServerSettings.hiddenPages != null) {
    return store.getters.storeServerSettings.hiddenPages.indexOf(name) === -1
  } else {
    return true
  }
}

const objectsAreSame = (x, y) => {
  let objectsAreSame = true
  for (const propertyName in x) {
    if (x[propertyName] !== y[propertyName]) {
      objectsAreSame = false
      break
    }
  }
  return objectsAreSame
}

const objectArraysAreSame = (x, y) => {
  if ((x === null && y !== null) || (x !== null && y === null)) {
    return false
  } else if (x.length !== y.length) {
    return false
  } else {
    for (let one = 0; one < x.length; one++) {
      let hasMatch = false
      for (let two = 0; two < y.length; two++) {
        if (objectsAreSame(x[one], y[two])) {
          hasMatch = true
          break
        }
      }

      if (!hasMatch) {
        return false
      }
    }
    return true
  }
}

/**
 * Downloads the data file given in the parameter using the blow, filename and extension.
 * @param {Object} object Object of type `{ filename: '', blob: '', extension: '' }`
 */
const downloadBlob = (object) => {
  if (!object || !object.blob) {
    return
  }

  const filename = object.filename
  const extension = object.extension

  const url = window.URL.createObjectURL(object.blob)

  const downloadLink = document.createElement('a')
  downloadLink.href = url
  downloadLink.target = '_blank'
  downloadLink.rel = 'noopener noreferrer'
  if (filename) {
    downloadLink.download = filename

    if (extension) {
      downloadLink.download += '.' + extension
    }
  }
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)

  event('download', 'data', filename + '.' + extension)
}

/**
 * Downloads all SVGs contained in the given DOM element into a single SVG file
 * @param {Element} container The DOM element
 * @param {Boolean} isPlotly Is this a plotly.js chart?
 * @param {String} filename The file name to use for the downloaded file
 */
const downloadSvgsFromContainer = (container, isPlotly, filename) => {
  // get svg source.
  const serializer = new XMLSerializer()
  const svgs = isPlotly ? container.querySelectorAll('svg:not(.icon):not(:last-child)') : container.querySelectorAll('svg')
  let source = '<?xml version="1.0" standalone="no"?>\r\n<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">'

  svgs.forEach(s => {
    // serializer.serializeToString(s)
    const children = s.children
    for (let i = 0; i < children.length; i++) {
      source += serializer.serializeToString(children[i]) + '\r\n'
    }
  })

  source += '</svg>'

  // convert svg source to URI data scheme.
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source)

  const downloadLink = document.createElement('a')
  downloadLink.href = url
  downloadLink.download = filename + '.svg'
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)

  event('download', 'svg', filename + '.svg')
}

export {
  germinateVersion,
  uuidv4,
  getTableColumnStyle,
  isPageAvailable,
  objectArraysAreSame,
  objectsAreSame,
  downloadBlob,
  downloadSvgsFromContainer
}
