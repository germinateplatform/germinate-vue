import { mapGetters } from 'vuex'

export default {
  data: function () {
    return {
      germinateVersion: '4.3.4'
    }
  },
  computed: {
    ...mapGetters([
      'storeHiddenColumns',
      'storeServerSettings'
    ])
  },
  methods: {
    /**
     * Generates a v4 UUID
     */
    uuidv4: function () {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    },
    /**
     * Checks whether the given column key in the given table is hidden or not
     * @param {String} tableName The name of the table
     * @param {String} columnKey The name of the column
     */
    isTableColumnHidden: function (tableName, columnKey) {
      if (this.storeHiddenColumns[tableName]) {
        return (this.storeHiddenColumns[tableName].indexOf(columnKey) !== -1) ? 'd-none' : ''
      } else {
        return ''
      }
    },
    /**
     * Checks if the page with the given name is available in this configuration.
     * @param {String} name The name of the page to check (refer to router for names)
     */
    isPageAvailable: function (name) {
      if (this.storeServerSettings != null && this.storeServerSettings.hiddenPages != null) {
        return this.storeServerSettings.hiddenPages.indexOf(name) === -1
      } else {
        return true
      }
    },
    objectArraysAreSame: function (x, y) {
      if ((x === null && y !== null) || (x !== null && y === null)) {
        return false
      } else if (x.length !== y.length) {
        return false
      } else {
        for (let one = 0; one < x.length; one++) {
          let hasMatch = false
          for (let two = 0; two < y.length; two++) {
            if (this.objectsAreSame(x[one], y[two])) {
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
    },
    objectsAreSame: function (x, y) {
      let objectsAreSame = true
      for (const propertyName in x) {
        if (x[propertyName] !== y[propertyName]) {
          objectsAreSame = false
          break
        }
      }
      return objectsAreSame
    },
    /**
     * Downloads the data file given in the parameter using the blow, filename and extension.
     * @param {Object} object Object of type `{ filename: '', blob: '', extension: '' }`
     */
    downloadBlob: function (object) {
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
      if (filename && extension) {
        downloadLink.download = filename + '.' + extension
      }
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      this.$gtag.event('download', 'data', filename + '.' + extension)
    },
    /**
     * Downloads all SVGs contained in the given DOM element into a single SVG file
     * @param {Element} container The DOM element
     * @param {Boolean} isPlotly Is this a plotly.js chart?
     * @param {String} filename The file name to use for the downloaded file
     */
    downloadSvgsFromContainer: function (container, isPlotly, filename) {
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

      this.$gtag.event('download', 'svg', filename + '.svg')
    }
  }
}
