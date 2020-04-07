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
import { EventBus } from '@/plugins/event-bus.js'
import datasetApi from '@/mixins/api/dataset.js'

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
    idKey: {
      type: String,
      default: null
    },
    nameKey: {
      type: String,
      default: null
    }
  },
  components: {
    DatasetMetadataDownload,
    ExportSelection
  },
  mixins: [ datasetApi ],
  methods: {
    downloadData: function (query) {
      EventBus.$emit('show-loading', true)
      this.apiPostDatasetExport(this.downloadKey, query, result => {
        var downloadRequest = {
          blob: result,
          filename: this.datasetType + '-dataset-' + this.datasetIds.join('-'),
          extension: 'txt'
        }

        this.downloadBlob(downloadRequest)
        EventBus.$emit('show-loading', false)
      })
    }
  }
}
</script>

<style>
</style>
