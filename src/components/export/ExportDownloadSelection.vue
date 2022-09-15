<template>
  <div>
    <ExportSelection v-bind="$props"
                     :min="1"
                     :max="null"
                     :onlyNumeric="false"
                     v-on:button-clicked="downloadData" />

    <DatasetMetadataDownload :datasetIds="datasetIds" :datasetType="datasetType" />
  </div>
</template>

<script>
import DatasetMetadataDownload from '@/components/util/DatasetMetadataDownload'
import ExportSelection from '@/components/export/ExportSelection'
import { apiPostDatasetExport } from '@/mixins/api/dataset.js'
import { downloadBlob } from '@/mixins/util'

const emitter = require('tiny-emitter/instance')

export default {
  props: {
    datasetIds: {
      type: Array,
      default: () => null
    },
    texts: {
      type: Object,
      default: () => {}
    },
    getItems: {
      type: Function,
      default: () => []
    },
    itemType: {
      type: String,
      default: 'germplasm'
    },
    groupType: {
      type: String,
      default: 'germinatebase'
    },
    datasetType: {
      type: String,
      default: null
    },
    downloadKey: {
      type: String,
      default: null
    },
    downloadFileExtension: {
      type: String,
      default: 'txt'
    },
    idKey: {
      type: String,
      default: null
    },
    nameKey: {
      type: String,
      default: null
    },
    groups: {
      type: Array,
      default: null
    }
  },
  components: {
    DatasetMetadataDownload,
    ExportSelection
  },
  methods: {
    downloadData: function (query) {
      emitter.emit('show-loading', true)
      apiPostDatasetExport(this.downloadKey, query, result => {
        const downloadRequest = {
          blob: result,
          filename: this.datasetType + '-dataset-' + this.datasetIds.join('-'),
          extension: this.downloadFileExtension
        }

        downloadBlob(downloadRequest)
        emitter.emit('show-loading', false)
      })
    }
  }
}
</script>

<style>
</style>
