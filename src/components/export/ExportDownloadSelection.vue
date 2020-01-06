<template>
  <div>
    <ExportSelection v-bind="$props"
                     :min="1"
                     :max="null"
                     :onlyNumeric="false"
                     v-on:button-clicked="downloadData" />

    <h2 class="mt-4">{{ $t('widgetDatasetDownloadMetadataTitle') }}</h2>
    <p>{{ $t('widgetDatasetDownloadMetadataText') }}</p>
    <b-button @click="downloadMetadata"><i class="mdi mdi-18px fix-alignment mdi-download" /> {{ $t('buttonDownload') }}</b-button>
  </div>
</template>

<script>
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
    experimentType: {
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
    ExportSelection
  },
  mixins: [ datasetApi ],
  methods: {
    downloadData: function (query) {
      EventBus.$emit('show-loading', true)
      this.apiPostDatasetExport(this.downloadKey, query, result => {
        var downloadRequest = {
          blob: result,
          filename: this.experimentType + '-dataset-' + this.datasetIds.join('-'),
          extension: 'txt'
        }

        this.downloadBlob(downloadRequest)
        EventBus.$emit('show-loading', false)
      })
    },
    downloadMetadata: function () {
      EventBus.$emit('show-loading', true)
      const request = {
        datasetIds: this.datasetIds
      }
      this.apiPostDatasetAttributeExport(request, result => {
        var downloadRequext = {
          blob: result,
          filename: this.experimentType + '-dataset-metadata-' + this.datasetIds.join('-'),
          extension: 'txt'
        }

        this.downloadBlob(downloadRequext)
        EventBus.$emit('show-loading', false)
      })
    }
  }
}
</script>

<style>
</style>
