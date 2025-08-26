import store from '@/store'
import { event } from 'vue-gtag'

const germinateVersion = '4.9.0'

const bskyIcon = 'M 6.3352642,4.3805537 C 8.6282167,6.1019578 11.094547,9.5922478 12.000058,11.465341 12.905639,9.5923853 15.371832,6.1019228 17.664853,4.3805537 19.319326,3.1384578 22,2.1773945 22,5.2355487 c 0,0.610755 -0.35017,5.1306603 -0.555548,5.8644483 -0.713893,2.551158 -3.315291,3.201843 -5.629278,2.808018 4.044804,0.68841 5.073763,2.968673 2.851604,5.248935 -4.22032,4.330665 -6.065826,-1.08658 -6.538927,-2.474675 C 12.041162,16.427804 12.000597,16.30876 12,16.409987 c -6e-4,-0.101231 -0.04116,0.01782 -0.127851,0.272288 C 11.399255,18.07037 9.5537833,23.487752 5.3332217,19.15695 3.1110283,16.876688 4.1399533,14.596287 8.1848258,13.908015 5.87077,14.30184 3.2693375,13.651151 2.5555483,11.099997 2.3501633,10.36614 2,5.8462353 2,5.2355487 2,2.1773945 4.6807425,3.1384578 6.3351467,4.3805537 Z'
const genesysIcon = 'M11.3,0C5.1,0,0,5.1,0,11.3c0,6.3,5.1,11.3,11.3,11.3s11.3-5.1,11.3-11.3C22.7,5.1,17.6,0,11.3,0z M11.4,19.7 c0,0.1-0.1,0.2,0,0.2c0,0,0,0.1,0,0.1c0,0.1,0,0.1,0,0.2c0,0,0,0.1-0.1,0.1l-0.1,0.1c-2.2-0.6-4-2.3-5.4-4c-1.5-1.9-2.7-4.2-3.1-6.6 C2.5,8.5,2.5,7.2,3,5.9c2.5,1.6,4.6,3.9,6.2,6.4C10.5,14.5,11.4,17,11.4,19.7C11.4,19.6,11.4,19.6,11.4,19.7z M11.5,11.7 c0,0-0.1,0.1-0.1,0.1c0,0,0,0,0,0c0,0-0.1,0-0.1,0.1c0,0,0,0-0.1,0l-0.1,0c-0.9-1-1.3-2.4-1.5-3.7C9.4,6.9,9.5,5.4,10,4.1 c0.3-0.7,0.7-1.4,1.3-1.9c0.8,1.6,1.2,3.3,1.2,5.1C12.6,8.8,12.3,10.4,11.5,11.7C11.5,11.7,11.5,11.7,11.5,11.7z M17.3,12.6 c-1.2,1.7-2.8,3.2-4.7,4c0,0,0,0,0,0c-0.1,0-0.1,0-0.2,0c0,0-0.1,0-0.1,0c-0.1,0-0.1,0-0.1,0c0,0-0.1,0-0.1,0l-0.1-0.1 c-0.2-1.8,0.4-3.7,1.3-5.3c1-1.7,2.3-3.3,4-4.4c0.9-0.6,1.9-1,3-1C19.7,8.3,18.7,10.6,17.3,12.6z'

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

const getGermplasmDisplayName = (germplasm) => {
  if (!germplasm) {
    return 'N/A'
  } else if (germplasm.germplasmDisplayName && (germplasm.germplasmDisplayName !== germplasm.germplasmName)) {
    return `${germplasm.germplasmDisplayName} (${germplasm.germplasmName})`
  } else {
    return germplasm.germplasmName
  }
}

const isNumber = (value, isInt) => {
  try {
    const int = Number(value)
    if (isNaN(value) || isNaN(int) || (isInt && !Number.isInteger(int))) {
      return false
    }

    return true
  } catch (err) {
    return false
  }
}

const mcpdDateToJsDate = (input) => {
  if (!input) {
    return null
  }

  if (input.length === 4) {
    return new Date(input)
  } else if (input.length === 6) {
    return new Date(`${input.substring(0, 4)}-${input.substring(4, 6).replace('--', '01').replace('00', '01')}`)
  } else if (input.length === 8) {
    return new Date(`${input.substring(0, 4)}-${input.substring(4, 6).replace('--', '01').replace('00', '01')}-${input.substring(6, 8).replace('--', '01').replace('00', '01')}`)
  } else if (input.length === 10) {
    return new Date(`${input.substring(0, 4)}-${input.substring(5, 7).replace('--', '01').replace('00', '01')}-${input.substring(8, 10).replace('--', '01').replace('00', '01')}`)
  } else {
    return null
  }
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

const dataURLtoFile = (dataurl, filename) => {
  const arr = dataurl.split(',')
  const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

export {
  germinateVersion,
  uuidv4,
  getTableColumnStyle,
  isPageAvailable,
  objectArraysAreSame,
  objectsAreSame,
  downloadBlob,
  downloadSvgsFromContainer,
  dataURLtoFile,
  mcpdDateToJsDate,
  isNumber,
  getGermplasmDisplayName,
  bskyIcon,
  genesysIcon
}
